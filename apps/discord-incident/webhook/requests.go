package webhook

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func (wc *WebhookClient) createRequest(method string, url string, payload any) (*http.Request, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	requestBody := bytes.NewBuffer(data)

	req, err := http.NewRequest(method, url, requestBody)
	if err != nil {
		return req, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bot %s", wc.config.Discord.Token))

	return req, nil
}

func (wc *WebhookClient) executeRequest(req *http.Request) error {
	resp, err := wc.http.Do(req)
	if err != nil {
		if resp != nil {
			resp.Body.Close()
		}
		return err
	}

	defer resp.Body.Close()

	return nil
}
