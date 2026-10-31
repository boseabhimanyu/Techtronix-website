package handler

import (
	"errors"
	"net/http"

	"basic-app/apperrors"
	"basic-app/dto"
	"basic-app/services"

	"github.com/gin-gonic/gin"
)

type EnquiryHandler struct {
	enquiryService *services.EnquiryService
}

func NewEnquiryHandler(service *services.EnquiryService) *EnquiryHandler {
	return &EnquiryHandler{
		enquiryService: service,
	}
}

// POST /api/enquiries (Public)
func (h *EnquiryHandler) Submit(c *gin.Context) {
	var req dto.CreateEnquiryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid enquiry request payload"})
		return
	}

	id, err := h.enquiryService.Submit(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Enquiry submitted successfully",
		"id":      id,
	})
}

// GET /api/admin/enquiries (Admin Protected)
func (h *EnquiryHandler) List(c *gin.Context) {
	var query dto.EnquiryQueryFilter
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	enquiries, total, page, totalPages, err := h.enquiryService.List(c.Request.Context(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.EnquiryListResponse{
		Enquiries:  enquiries,
		Total:      total,
		Page:       page,
		TotalPages: totalPages,
	})
}

// GET /api/admin/enquiries/:id (Admin Protected)
func (h *EnquiryHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	enquiry, err := h.enquiryService.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, apperrors.ErrEnquiryNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Enquiry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, enquiry)
}

// PATCH /api/v1/admin/enquiries (Handles single or bulk status updates)
func (h *EnquiryHandler) UpdateStatus(c *gin.Context) {
	var req dto.UpdateEnquiryStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: 'ids' and valid 'status' are required"})
		return
	}

	modifiedCount, err := h.enquiryService.UpdateStatuses(c.Request.Context(), req.IDs, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Status updated successfully",
		"modified": modifiedCount,
	})
}

// DELETE /api/v1/admin/enquiries (Handles single or bulk deletes)
func (h *EnquiryHandler) DeleteMany(c *gin.Context) {
	var req dto.DeleteEnquiriesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: 'ids' array is required"})
		return
	}

	deletedCount, err := h.enquiryService.DeleteMany(c.Request.Context(), req.IDs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Enquiries deleted successfully",
		"deleted": deletedCount,
	})
}
