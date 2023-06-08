package webhook

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func CreateRequest(wc *WebhookClient, method string, url string, payload any) (*http.Request, error) {
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
	req.Header.Set("Authorization", "Bot "+wc.Config.Discord.Token)

	return req, nil
}

func ExecuteRequest(wc *WebhookClient, req *http.Request) error {
	resp, err := wc.Http.Do(req)
	if err != nil {
		if resp != nil {
			resp.Body.Close()
		}
		return err
	}

	defer resp.Body.Close()

	return nil
}
