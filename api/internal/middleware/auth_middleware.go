package middleware

import (
	"context"
	"fmt"
	"net/http"
	"velocityper/api/internal/lib/auth"
	"velocityper/api/internal/utils"
)

// auth middleware

func AuthMiddleware(next http.HandlerFunc) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// middleware
		authToken := r.Header.Get("Authorization")
		fmt.Println("Auth Middleware: Token -> ", authToken)
		claims, err := auth.VerifyAndParseSignedToken(authToken)
		if err != nil {
			utils.HttpResponse(w, http.StatusForbidden, "Token Invalid", nil)
			return
		}
		ctx := context.WithValue(r.Context(), "userId", claims.Id)
		newReq := r.WithContext(ctx)
		next.ServeHTTP(w, newReq)
	})
}

// tried experimenting with http.Handler and http.HandlerFunc

// turns out http.Handler is an interface and http.HandlerFunc is basically a type function
// that has the method ServeHTTP so it qualifies as an http.Handler as well

func AuthMiddleware2(next http.HandlerFunc) http.HandlerFunc {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// middleware
		authToken := r.Header.Get("Authorization")
		fmt.Println("Auth Middleware: Token -> ", authToken)
		claims, err := auth.VerifyAndParseSignedToken(authToken)
		if err != nil {
			utils.HttpResponse(w, http.StatusForbidden, "Token Invalid", nil)
			return
		}
		ctx := context.WithValue(r.Context(), "userId", claims.Id)
		newReq := r.WithContext(ctx)
		next.ServeHTTP(w, newReq)
	})
}
