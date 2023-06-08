package sentry

import (
	"log"
	"time"

	"github.com/getsentry/sentry-go"
)

func Init(sentryDsn string) {
	err := sentry.Init(sentry.ClientOptions{
		Dsn:              sentryDsn,
		TracesSampleRate: 0.2,
	})
	if err != nil {
		log.Fatalf("Error when initializing Sentry: %s", err)
	}

	defer sentry.Flush(2 * time.Second)
}
