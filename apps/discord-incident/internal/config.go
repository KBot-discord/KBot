package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	Discord *Discord `json:"discord"`
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
