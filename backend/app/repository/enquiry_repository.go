package repository

import (
	"context"
	"time"

	"basic-app/models"
)

type EnquiryListFilter struct {
	Status   *models.EnquiryStatus
	Service  string
	FromDate *time.Time
	ToDate   *time.Time
	Skip     int64
	Limit    int64
}

type EnquiryRepository interface {
	Create(ctx context.Context, enquiry *models.Enquiry) (string, error)
	FindByID(ctx context.Context, id string) (*models.Enquiry, error)
	List(ctx context.Context, filter EnquiryListFilter) ([]*models.Enquiry, int64, error)
	UpdateStatus(ctx context.Context, id string, status models.EnquiryStatus) error
	UpdateStatuses(ctx context.Context, ids []string, status models.EnquiryStatus) (int64, error)
	DeleteMany(ctx context.Context, ids []string) (int64, error)
}
