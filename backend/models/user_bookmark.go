package models

import "time"

// UserBookmark represents a user's bookmarked word or topic
type UserBookmark struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"userId" gorm:"not null"`
	WordID    *uint     `json:"wordId"`
	TopicID   *uint     `json:"topicId"`
	CreatedAt time.Time `json:"createdAt"`

	// Relations
	User  User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Word  *Word  `json:"word,omitempty" gorm:"foreignKey:WordID"`
	Topic *Topic `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
}

// TableName specifies the table name for UserBookmark
func (UserBookmark) TableName() string {
	return "user_bookmarks"
}
