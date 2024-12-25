package auth

import (
	"fmt"
	"time"
	"velocityper/api/internal/config"

	"github.com/golang-jwt/jwt/v5"
	//"github.com/golang-jwt/jwt"
)

type ClaimsPayload struct {
	Id   string `json:"id"`
	Role int    `json:"role"`
	jwt.RegisteredClaims
}

type JWTPayload struct {
	Id   string
	Role int
}

func GetSignedToken(payload JWTPayload) (string, error) {
	//key:=os.Getegid()
	key := config.GetEnv("JWT_SECRET")

	claims := ClaimsPayload{
		payload.Id,
		payload.Role,
		jwt.RegisteredClaims{
			//ExpiresAt: 15000,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			Issuer:    "test",
		},
	}
	//CustomC
	//fmt.Println("c: ", c)
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(key.(string)))
}

func VerifyAndParseSignedToken(tokenString string) (*ClaimsPayload, error) {
	var err error
	key := config.GetEnv("JWT_SECRET")
	fmt.Println("key", key)
	token, err := jwt.ParseWithClaims(tokenString, &ClaimsPayload{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(key.(string)), nil
	})
	if err != nil {
		fmt.Println("token invalid", err)
		return &ClaimsPayload{}, err
	}
	fmt.Printf("token %+v=>", token.Claims)
	return token.Claims.(*ClaimsPayload), nil
}
