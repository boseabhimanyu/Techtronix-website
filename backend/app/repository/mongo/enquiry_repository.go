package mongo

import (
	"context"
	"errors"
	"time"

	"basic-app/apperrors"
	"basic-app/models"
	"basic-app/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const enquiryCollection = "enquiries"

type EnquiryRepository struct {
	collection *mongo.Collection
}

func NewEnquiryRepository(db *mongo.Database) repository.EnquiryRepository {
	return &EnquiryRepository{
		collection: db.Collection(enquiryCollection),
	}
}

func (r *EnquiryRepository) Create(ctx context.Context, enquiry *models.Enquiry) (string, error) {
	if enquiry.ID.IsZero() {
		enquiry.ID = bson.NewObjectID()
	}

	now := time.Now().UTC()
	if enquiry.CreatedAt.IsZero() {
		enquiry.CreatedAt = now
	}
	enquiry.UpdatedAt = now

	if enquiry.Status == "" {
		enquiry.Status = models.EnquiryStatusNew
	}

	_, err := r.collection.InsertOne(ctx, enquiry)
	if err != nil {
		return "", err
	}

	return enquiry.ID.Hex(), nil
}

func (r *EnquiryRepository) FindByID(ctx context.Context, id string) (*models.Enquiry, error) {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, apperrors.ErrEnquiryNotFound
	}

	var enquiry models.Enquiry
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&enquiry)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperrors.ErrEnquiryNotFound
		}
		return nil, err
	}

	return &enquiry, nil
}

func (r *EnquiryRepository) List(ctx context.Context, filter repository.EnquiryListFilter) ([]*models.Enquiry, int64, error) {
	query := bson.M{}

	if filter.Status != nil && *filter.Status != "" {
		query["status"] = *filter.Status
	}

	if filter.Service != "" {
		query["service"] = filter.Service
	}

	if filter.FromDate != nil || filter.ToDate != nil {
		dateRange := bson.M{}
		if filter.FromDate != nil {
			dateRange["$gte"] = *filter.FromDate
		}
		if filter.ToDate != nil {
			dateRange["$lte"] = *filter.ToDate
		}
		query["created_at"] = dateRange
	}

	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	if filter.Skip > 0 {
		findOptions.SetSkip(filter.Skip)
	}
	if filter.Limit > 0 {
		findOptions.SetLimit(filter.Limit)
	}

	cursor, err := r.collection.Find(ctx, query, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var enquiries []*models.Enquiry
	if err := cursor.All(ctx, &enquiries); err != nil {
		return nil, 0, err
	}

	return enquiries, total, nil
}

func (r *EnquiryRepository) UpdateStatus(ctx context.Context, id string, status models.EnquiryStatus) error {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return apperrors.ErrEnquiryNotFound
	}

	result, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": objectID},
		bson.M{
			"$set": bson.M{
				"status":     status,
				"updated_at": time.Now().UTC(),
			},
		},
	)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return apperrors.ErrEnquiryNotFound
	}

	return nil
}

func (r *EnquiryRepository) UpdateStatuses(ctx context.Context, ids []string, status models.EnquiryStatus) (int64, error) {
	if len(ids) == 0 {
		return 0, apperrors.ErrEmptyEnquiryIDs
	}

	objectIDs := make([]bson.ObjectID, 0, len(ids))
	for _, id := range ids {
		objectID, err := bson.ObjectIDFromHex(id)
		if err != nil {
			return 0, apperrors.ErrInvalidEnquiryID
		}
		objectIDs = append(objectIDs, objectID)
	}

	result, err := r.collection.UpdateMany(
		ctx,
		bson.M{"_id": bson.M{"$in": objectIDs}},
		bson.M{
			"$set": bson.M{
				"status":     status,
				"updated_at": time.Now().UTC(),
			},
		},
	)
	if err != nil {
		return 0, err
	}

	return result.ModifiedCount, nil
}

func (r *EnquiryRepository) Delete(ctx context.Context, id string) error {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return apperrors.ErrEnquiryNotFound
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return apperrors.ErrEnquiryNotFound
	}

	return nil
}

// DeleteMany deletes one or more enquiries by string hex IDs
func (r *EnquiryRepository) DeleteMany(
	ctx context.Context,
	ids []string,
) (int64, error) {
	if len(ids) == 0 {
		return 0, apperrors.ErrEmptyEnquiryIDs
	}

	objectIDs := make([]bson.ObjectID, 0, len(ids))
	for _, id := range ids {
		objectID, err := bson.ObjectIDFromHex(id)
		if err != nil {
			return 0, apperrors.ErrInvalidEnquiryID
		}
		objectIDs = append(objectIDs, objectID)
	}

	result, err := r.collection.DeleteMany(
		ctx,
		bson.M{
			"_id": bson.M{"$in": objectIDs},
		},
	)
	if err != nil {
		return 0, err
	}

	return result.DeletedCount, nil
}
