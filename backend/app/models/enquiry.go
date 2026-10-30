package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type EnquiryStatus string

const (
	EnquiryStatusNew       EnquiryStatus = "NEW"
	EnquiryStatusContacted EnquiryStatus = "CONTACTED"
	EnquiryStatusClosed    EnquiryStatus = "CLOSED"
)

type Enquiry struct {
	ID        bson.ObjectID `bson:"_id,omitempty"`
	Name      string        `bson:"name"`
	Phone     string        `bson:"phone"`
	Email     string        `bson:"email"`
	Service   string        `bson:"service"`
	Message   string        `bson:"message"`
	PinCode   string        `bson:"pincode"`
	Status    EnquiryStatus `bson:"status"`
	CreatedAt time.Time     `bson:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at"`
}
