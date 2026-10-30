package services

import (
	"context"
	"errors"
	"strings"
	"time"

	"basic-app/apperrors"
	"basic-app/dto"
	"basic-app/models"
	"basic-app/repository"
	"basic-app/validation"

	"github.com/microcosm-cc/bluemonday"
)

var strictSanitizer = bluemonday.StrictPolicy()

type EnquiryService struct {
	enquiryRepository repository.EnquiryRepository
}

func NewEnquiryService(repo repository.EnquiryRepository) *EnquiryService {
	return &EnquiryService{
		enquiryRepository: repo,
	}
}

func (s *EnquiryService) Submit(ctx context.Context, req *dto.CreateEnquiryRequest) (string, error) {
	// 1. Mandatory: Name
	if strings.TrimSpace(req.Name) == "" {
		return "", errors.New("name is required")
	}
	cleanName, err := validation.ValidateName(req.Name, "Name")
	if err != nil {
		return "", err
	}

	// 2. Mandatory: Phone
	if strings.TrimSpace(req.Phone) == "" {
		return "", errors.New("phone number is required")
	}
	cleanPhone, err := validation.ValidatePhone(req.Phone)
	if err != nil {
		return "", err
	}

	// 3. Mandatory: Service
	serviceType := strings.TrimSpace(strictSanitizer.Sanitize(req.Service))
	if serviceType == "" {
		return "", errors.New("service selection is required")
	}

	// 4. Optional: Email (only validate if provided)
	var cleanEmail string
	if strings.TrimSpace(req.Email) != "" {
		cleanEmail, err = validation.ValidateEmail(req.Email, false)
		if err != nil {
			return "", err
		}
	}

	// 5. Optional: Message (sanitize plain text if present)
	message := strings.TrimSpace(strictSanitizer.Sanitize(req.Message))

	// 6. Optional: PinCode
	pinCode := strings.TrimSpace(strictSanitizer.Sanitize(req.PinCode))

	enquiry := &models.Enquiry{
		Name:    cleanName,
		Phone:   cleanPhone,
		Email:   cleanEmail,
		Service: serviceType,
		Message: message,
		PinCode: pinCode,
		Status:  models.EnquiryStatusNew,
	}

	return s.enquiryRepository.Create(ctx, enquiry)
}

func (s *EnquiryService) UpdateStatuses(
	ctx context.Context,
	ids []string,
	status models.EnquiryStatus,
) (int64, error) {
	// Filter out empty strings if any passed
	cleanIDs := make([]string, 0, len(ids))
	for _, id := range ids {
		trimmed := strings.TrimSpace(id)
		if trimmed != "" {
			cleanIDs = append(cleanIDs, trimmed)
		}
	}

	if len(cleanIDs) == 0 {
		return 0, errors.New("nothing to update: no ids provided")
	}

	if !isValidEnquiryStatus(status) {
		return 0, apperrors.ErrInvalidEnquiryStatus
	}

	return s.enquiryRepository.UpdateStatuses(ctx, cleanIDs, status)
}

func (s *EnquiryService) DeleteMany(
	ctx context.Context,
	ids []string,
) (int64, error) {
	// Filter out empty strings if any passed
	cleanIDs := make([]string, 0, len(ids))
	for _, id := range ids {
		trimmed := strings.TrimSpace(id)
		if trimmed != "" {
			cleanIDs = append(cleanIDs, trimmed)
		}
	}

	if len(cleanIDs) == 0 {
		return 0, errors.New("nothing to delete: no ids provided")
	}

	return s.enquiryRepository.DeleteMany(ctx, cleanIDs)
}

func (s *EnquiryService) GetByID(ctx context.Context, id string) (*dto.EnquiryResponse, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, apperrors.ErrInvalidEnquiryID
	}

	enquiry, err := s.enquiryRepository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return mapToEnquiryResponse(enquiry), nil
}

func (s *EnquiryService) List(
	ctx context.Context,
	opts dto.EnquiryQueryFilter,
) ([]*dto.EnquiryResponse, int64, int, int, error) {
	page := opts.Page
	if page < 1 {
		page = 1
	}

	limit := opts.Limit
	if limit == 0 {
		limit = 20
	}
	if limit < 1 || limit > 100 {
		return nil, 0, 0, 0, apperrors.ErrInvalidLimit
	}

	var fromDate, toDate *time.Time
	if opts.FromDate != "" {
		if t, err := time.Parse("2006-01-02", opts.FromDate); err == nil {
			fromDate = &t
		}
	}
	if opts.ToDate != "" {
		if t, err := time.Parse("2006-01-02", opts.ToDate); err == nil {
			tEnd := t.Add(24*time.Hour - time.Nanosecond)
			toDate = &tEnd
		}
	}

	filter := repository.EnquiryListFilter{
		Status:   opts.Status,
		Service:  strings.TrimSpace(opts.Service),
		FromDate: fromDate,
		ToDate:   toDate,
		Skip:     int64(page-1) * int64(limit),
		Limit:    int64(limit),
	}

	enquiries, total, err := s.enquiryRepository.List(ctx, filter)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	totalPages := 0
	if total > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	responses := make([]*dto.EnquiryResponse, len(enquiries))
	for i, in := range enquiries {
		responses[i] = mapToEnquiryResponse(in)
	}

	return responses, total, page, totalPages, nil
}

func isValidEnquiryStatus(status models.EnquiryStatus) bool {
	return status == models.EnquiryStatusNew ||
		status == models.EnquiryStatusContacted ||
		status == models.EnquiryStatusClosed
}

func mapToEnquiryResponse(in *models.Enquiry) *dto.EnquiryResponse {
	return &dto.EnquiryResponse{
		ID:        in.ID.Hex(),
		Name:      in.Name,
		Phone:     in.Phone,
		Email:     in.Email,
		Service:   in.Service,
		Message:   in.Message,
		PinCode:   in.PinCode,
		Status:    in.Status,
		CreatedAt: in.CreatedAt,
		UpdatedAt: in.UpdatedAt,
	}
}
