package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	Env     string   `json:"env"`
	Discord *Discord `json:"discord"`
	Sentry  string   `json:"sentry"`
}

type Discord struct {
	ID    string `json:"id"`
	Token string `json:"token"`
}

func Load(path string) (*Config, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = json.Unmarshal(file, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
