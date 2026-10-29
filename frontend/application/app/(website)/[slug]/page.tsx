import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import styles from "./editor-typography.module.css";
import "../../../styles/page-custom-styles.css";
import type { Metadata } from "next";

type Page = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  slug: string;
  visibility: "public" | "registered";
  createdAt: string;
  updatedAt: string;
};

type PageResponse = {
  page: Page;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  return {
    title: page ? `${page.title} | Computer & IT Services` : "Page Not Found",
  };
}

async function getPage(slug: string): Promise<Page | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  // 1. Forward client cookies so the backend knows if the user is logged in
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(
    `${apiUrl}/pages/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    },
  );

    // 2. Page doesn't exist
  if (response.status === 404) {
    return null;
  }

  // 3. Page is registered-only and user is unauthenticated or unauthorized
  if (response.status === 401 || response.status === 403) {
    redirect(`/login?callbackUrl=/${encodeURIComponent(slug)}`);
  }

    // 4. Any unexpected 500 error
  if (!response.ok) {
    throw new Error("Unable to load page.");
  }

  const data = (await response.json()) as PageResponse;
  return data.page ?? null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
   <article className="min-h-[650px] rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-2xl">
      {/* Page Header */}
      <header className="border-b border-slate-800/80 pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {page.title}
          </h1>

          {page.visibility === "registered" && (
            <span className="rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-0.5 text-xs font-semibold text-cyan-300">
              Registered Only
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm text-slate-400">
          <span>Published: <strong className="text-slate-300 font-medium">{formatDate(page.createdAt)}</strong></span>
          <span>Last Updated: <strong className="text-slate-300 font-medium">{formatDate(page.updatedAt)}</strong></span>
        </div>
      </header>

      {/* Dynamic Body Content */}
      <div
        className={styles.typographyContainer}
        dangerouslySetInnerHTML={{
          __html: page.content,
        }}
      />
    </article>
  );
}