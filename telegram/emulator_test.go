package telegram

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"testing"
)

// postJSON POSTs a JSON payload to the fake Bot API and returns the HTTP
// status code and decoded envelope.
func postJSON(t *testing.T, url string, payload any) (status int, env map[string]any) {
	t.Helper()
	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal payload: %v", err)
	}
	resp, err := http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("POST %s: %v", url, err)
	}
	defer func() { _ = resp.Body.Close() }()
	_ = json.NewDecoder(resp.Body).Decode(&env)
	return resp.StatusCode, env
}

// resultOf extracts the "result" object from a decoded envelope, failing the
// test if it isn't a JSON object.
func resultOf(t *testing.T, env map[string]any) map[string]any {
	t.Helper()
	result, ok := env["result"].(map[string]any)
	if !ok {
		t.Fatalf("envelope has no object result: %v", env)
	}
	return result
}

func TestHandleSendMessage_MissingChatID_Returns400(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	status, env := postJSON(t, e.BotAPIURL()+"/botTEST/sendMessage", map[string]any{"text": "hi"})
	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", status, http.StatusBadRequest)
	}
	if ok, _ := env["ok"].(bool); ok {
		t.Fatalf("envelope ok = true, want false: %v", env)
	}
	desc, _ := env["description"].(string)
	if !strings.Contains(desc, "chat_id") {
		t.Fatalf("description = %q, want it to mention chat_id", desc)
	}
}

func TestHandleSendMessage_MissingText_Returns400(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	status, env := postJSON(t, e.BotAPIURL()+"/botTEST/sendMessage", map[string]any{"chat_id": 123})
	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", status, http.StatusBadRequest)
	}
	desc, _ := env["description"].(string)
	if !strings.Contains(desc, "text") {
		t.Fatalf("description = %q, want it to mention text", desc)
	}
}

func TestHandleSendMessage_MalformedJSON_Returns400(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	resp, err := http.Post(e.BotAPIURL()+"/botTEST/sendMessage", "application/json", bytes.NewReader([]byte("{not valid json")))
	if err != nil {
		t.Fatalf("POST: %v", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
	var env map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&env)
	if ok, _ := env["ok"].(bool); ok {
		t.Fatalf("envelope ok = true, want false: %v", env)
	}
}

func TestMessageDeliveryRejectsMalformedInlineMarkup(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	// A Telegram inline keyboard button needs exactly one action. The production
	// API rejects this payload; accepting it in the emulator would hide a broken
	// card until a real user opens it.
	invalidMarkup := map[string]any{
		"inline_keyboard": [][]map[string]any{{{"text": "No action"}}},
	}

	for _, tc := range []struct {
		name    string
		method  string
		payload map[string]any
	}{
		{
			name:   "sendMessage JSON",
			method: "sendMessage",
			payload: map[string]any{
				"chat_id": 42, "text": "card", "reply_markup": invalidMarkup,
			},
		},
		{
			name:   "editMessageText JSON",
			method: "editMessageText",
			payload: map[string]any{
				"chat_id": 42, "message_id": 1, "text": "card", "reply_markup": invalidMarkup,
			},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			status, envelope := postJSON(t, e.BotAPIURL()+"/botTEST/"+tc.method, tc.payload)
			if status != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d: %v", status, http.StatusBadRequest, envelope)
			}
			if description, _ := envelope["description"].(string); !strings.Contains(description, "reply_markup") {
				t.Fatalf("description = %q, want reply_markup validation error", description)
			}
		})
	}
}

func TestSendMessageFormRejectsMalformedInlineMarkup(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	form := url.Values{
		"chat_id":      {"42"},
		"text":         {"card"},
		"reply_markup": {"{not valid JSON"},
	}
	response, err := http.Post(
		e.BotAPIURL()+"/botTEST/sendMessage",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("POST: %v", err)
	}
	defer func() { _ = response.Body.Close() }()
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", response.StatusCode, http.StatusBadRequest)
	}
	var envelope map[string]any
	if err = json.NewDecoder(response.Body).Decode(&envelope); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if description, _ := envelope["description"].(string); !strings.Contains(description, "reply_markup") {
		t.Fatalf("description = %q, want reply_markup validation error", description)
	}
}

func TestHandleSendMessage_ResponseHasJournalAssignedMessageID(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	status, env := postJSON(t, e.BotAPIURL()+"/botTEST/sendMessage", map[string]any{"chat_id": 42, "text": "hi"})
	if status != http.StatusOK {
		t.Fatalf("status = %d, want %d: %v", status, http.StatusOK, env)
	}
	result := resultOf(t, env)
	if id, _ := result["message_id"].(float64); id != 1 {
		t.Fatalf("result.message_id = %v, want 1", result["message_id"])
	}
	if txt, _ := result["text"].(string); txt != "hi" {
		t.Fatalf("result.text = %q, want %q", txt, "hi")
	}

	// A second send in the same chat gets the next ID in the shared sequence.
	_, env2 := postJSON(t, e.BotAPIURL()+"/botTEST/sendMessage", map[string]any{"chat_id": 42, "text": "again"})
	result2 := resultOf(t, env2)
	if id, _ := result2["message_id"].(float64); id != 2 {
		t.Fatalf("second result.message_id = %v, want 2", result2["message_id"])
	}
}

func TestUnsupportedMethod_ReturnsErrorAndJournalsCall(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	status, env := postJSON(t, e.BotAPIURL()+"/botTEST/sendPhoto", map[string]any{"chat_id": 42, "photo": "file-id"})
	if status != http.StatusNotImplemented {
		t.Fatalf("status = %d, want %d", status, http.StatusNotImplemented)
	}
	if ok, _ := env["ok"].(bool); ok {
		t.Fatalf("envelope ok = true, want false: %v", env)
	}
	if code, _ := env["error_code"].(float64); code != 501 {
		t.Fatalf("error_code = %v, want 501", env["error_code"])
	}
	desc, _ := env["description"].(string)
	if !strings.Contains(desc, "sendPhoto") {
		t.Fatalf("description = %q, want it to mention sendPhoto", desc)
	}

	// The call is recorded in the journal, attributed to the chat it named,
	// so a transcript surfaces it — "bot also called sendPhoto (uncaptured)"
	// — instead of a bare "no message arrived" that gives no hint the bot did
	// something, just not something chatwright can see.
	transcript := e.Transcript(42)
	if !strings.Contains(transcript, "sendPhoto") || !strings.Contains(transcript, "uncaptured") {
		t.Fatalf("transcript = %q, want it to mention the uncaptured sendPhoto call", transcript)
	}
}

func TestAcknowledgedMethod_StillReturnsOKAndIsNotJournaled(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	for _, method := range []string{"setWebhook", "deleteWebhook", "answerCallbackQuery", "setMyCommands"} {
		status, env := postJSON(t, e.BotAPIURL()+"/botTEST/"+method, map[string]any{"chat_id": 42})
		if status != http.StatusOK {
			t.Errorf("%s: status = %d, want %d", method, status, http.StatusOK)
		}
		if ok, _ := env["ok"].(bool); !ok {
			t.Errorf("%s: envelope ok = false, want true: %v", method, env)
		}
	}

	// These are legitimately no-op: nothing should show up in the transcript
	// for them, unlike a genuinely unsupported (message-producing) method.
	transcript := e.Transcript(42)
	if strings.Contains(transcript, "uncaptured") {
		t.Fatalf("transcript = %q, want no uncaptured-call entries for acknowledged methods", transcript)
	}
}

func TestHandleEditMessageText_JSONBody(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	_, sendEnv := postJSON(t, e.BotAPIURL()+"/botTEST/sendMessage", map[string]any{"chat_id": 7, "text": "Hello"})
	sendResult := resultOf(t, sendEnv)
	msgID := int(sendResult["message_id"].(float64))

	status, editEnv := postJSON(t, e.BotAPIURL()+"/botTEST/editMessageText", map[string]any{
		"chat_id":    7,
		"message_id": msgID,
		"text":       "Hello, edited",
	})
	if status != http.StatusOK {
		t.Fatalf("status = %d, want %d: %v", status, http.StatusOK, editEnv)
	}
	editResult := resultOf(t, editEnv)
	if txt, _ := editResult["text"].(string); txt != "Hello, edited" {
		t.Fatalf("result.text = %q, want %q", txt, "Hello, edited")
	}

	msg, ok := e.WaitForEdit(7, msgID, 0, 0)
	if !ok {
		t.Fatalf("WaitForEdit did not observe the JSON-bodied edit")
	}
	if msg.Text != "Hello, edited" {
		t.Fatalf("edited text = %q, want %q", msg.Text, "Hello, edited")
	}
}

func TestHandleEditMessageText_MissingFields_Returns400(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	status, env := postJSON(t, e.BotAPIURL()+"/botTEST/editMessageText", map[string]any{"text": "no chat or message id"})
	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", status, http.StatusBadRequest)
	}
	if ok, _ := env["ok"].(bool); ok {
		t.Fatalf("envelope ok = true, want false: %v", env)
	}
	desc, _ := env["description"].(string)
	if !strings.Contains(desc, "chat_id") || !strings.Contains(desc, "message_id") {
		t.Fatalf("description = %q, want it to mention chat_id and message_id", desc)
	}
}

func TestHandleEditMessageText_MalformedJSON_Returns400(t *testing.T) {
	e := NewEmulator()
	t.Cleanup(e.Close)

	resp, err := http.Post(e.BotAPIURL()+"/botTEST/editMessageText", "application/json", bytes.NewReader([]byte("{not valid json")))
	if err != nil {
		t.Fatalf("POST: %v", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
}
