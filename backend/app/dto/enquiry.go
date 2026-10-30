package dto

import (
	"time"

	"basic-app/models"
)

type CreateEnquiryRequest struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Service string `json:"service"`
	Message string `json:"message"`
	PinCode string `json:"pincode"`
}

type UpdateEnquiryStatusRequest struct {
	IDs    []string             `json:"ids"`
	Status models.EnquiryStatus `json:"status"`
}

type DeleteEnquiriesRequest struct {
	IDs []string `json:"ids"`
}

type EnquiryQueryFilter struct {
	Page     int                   `form:"page"`
	Limit    int                   `form:"limit"`
	Status   *models.EnquiryStatus `form:"status"`
	Service  string                `form:"service"`
	FromDate string                `form:"from"`
	ToDate   string                `form:"to"`
}

type EnquiryResponse struct {
	ID        string               `json:"id"`
	Name      string               `json:"name"`
	Phone     string               `json:"phone"`
	Email     string               `json:"email"`
	Service   string               `json:"service"`
	Message   string               `json:"message"`
	PinCode   string               `json:"pincode"`
	Status    models.EnquiryStatus `json:"status"`
	CreatedAt time.Time            `json:"createdAt"`
	UpdatedAt time.Time            `json:"updatedAt"`
}

type EnquiryListResponse struct {
	Enquiries  []*EnquiryResponse `json:"enquiries"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	TotalPages int                `json:"totalPages"`
}
