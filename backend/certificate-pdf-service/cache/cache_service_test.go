package cache

import (
	"bytes"
	"testing"
)

func Test_setCacheWithoutExpiry(t *testing.T) {
	type args struct {
		key   []byte
		value []byte
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "should store data in cache",
			args: args{
				key:   []byte("key1"),
				value: []byte("data"),
			},
			wantErr: false,
		},
	}
	Initialize()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := setCacheWithoutExpiry(tt.args.key, tt.args.value); (err != nil) != tt.wantErr {

				t.Errorf("setCacheWithoutExpiry() error = %v, wantErr %v", err, tt.wantErr)
			}
			value, _ := cache.Get(tt.args.key)
			if bytes.Equal(value, tt.args.value) {

			}
		})
	}
}

func Test_getCache(t *testing.T) {
	type args struct {
		key []byte
	}
	tests := []struct {
		name       string
		args       args
		wantErr    bool
		wantVal    string
		preExecute func()
	}{
		{
			name: "should return empty value for cache miss",
			args: args{
				key: []byte("key2"),
			},
			wantErr: true,
			wantVal: "",
			preExecute: func() {

			},
		},
		{
			name: "should return cached value for cache hit",
			args: args{
				key: []byte("key3"),
			},
			wantErr: false,
			wantVal: "data",
			preExecute: func() {
				_ = setCacheWithoutExpiry([]byte("key3"), []byte("data"))
			},
		},
	}
	Initialize()
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.preExecute()
			if value, err := getCache(test.args.key); (err != nil) != test.wantErr || string(value) != test.wantVal {
				t.Errorf("getCache() error = %v, wantErr %v, val = %v, wantVal = %v", err, test.wantErr, value, test.wantVal)
			}
		})
	}
}

func Test_GetStats(t *testing.T) {
	type args struct {
	}
	tests := []struct {
		name       string
		args       args
		wantErr    bool
		wantVal    Stats
		preExecute func()
	}{
		{
			name:    "should return empty status initially",
			args:    args{},
			wantErr: false,
			wantVal: Stats{
				EvacuateCount:     0,
				ExpiredCount:      0,
				EntryCount:        0,
				AverageAccessTime: 0,
				HitCount:          0,
				MissCount:         0,
				LookupCount:       0,
				HitRate:           0,
				OverwriteCount:    0,
				TouchedCount:      0,
			},
			preExecute: func() {

			},
		},
		{
			name:    "should return status after usage",
			args:    args{},
			wantErr: false,
			wantVal: Stats{
				EvacuateCount:     0,
				ExpiredCount:      0,
				EntryCount:        1,
				AverageAccessTime: 0,
				HitCount:          0,
				MissCount:         0,
				LookupCount:       0,
				HitRate:           0,
				OverwriteCount:    0,
				TouchedCount:      0,
			},
			preExecute: func() {
				_ = setCacheWithoutExpiry([]byte("key1"), []byte("value"))
			},
		},
		{
			name:    "should return status after set and get",
			args:    args{},
			wantErr: false,
			wantVal: Stats{
				EvacuateCount:     0,
				ExpiredCount:      0,
				EntryCount:        1,
				AverageAccessTime: 0,
				HitCount:          1,
				MissCount:         1,
				LookupCount:       0,
				HitRate:           0,
				OverwriteCount:    0,
				TouchedCount:      0,
			},
			preExecute: func() {
				_ = setCacheWithoutExpiry([]byte("key1"), []byte("value"))
				_, _ = getCache([]byte("key1"))
				_, _ = getCache([]byte("key2"))
			},
		},
	}
	Initialize()
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.preExecute()
			value := getStatus()
			if value.EntryCount != test.wantVal.EntryCount || value.HitCount != test.wantVal.HitCount || value.MissCount != test.wantVal.MissCount {
				t.Errorf("getStatus() val = %v, wantVal = %v", value, test.wantVal)
			}
		})
	}
}
func Test_clearAll(t *testing.T) {
	Initialize()
	key := []byte("key1")
	expectedValue := []byte("value")
	setCacheWithoutExpiry(key, expectedValue)
	cachedValue, _ := getCache(key)
	if !bytes.Equal(cachedValue, expectedValue) {
		t.Errorf("Invalid cached value actual = %v expected = %v", cachedValue, expectedValue)
	}
	clearAll()
	_, err := getCache(key)
	if err.Error() != "Entry not found" {
		t.Errorf("clearAll() error")
	}
}
