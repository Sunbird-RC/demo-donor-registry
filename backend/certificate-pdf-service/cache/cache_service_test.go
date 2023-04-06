package cache

import (
	"bytes"
	"github.com/allegro/bigcache/v3"
	"testing"
)

func Test_SetCacheWithoutExpiry(t *testing.T) {
	type args struct {
		key   string
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
				key:   "key1",
				value: []byte("data"),
			},
			wantErr: false,
		},
	}
	Initialize()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := SetCacheWithoutExpiry(tt.args.key, tt.args.value); (err != nil) != tt.wantErr {

				t.Errorf("SetCacheWithoutExpiry() error = %v, wantErr %v", err, tt.wantErr)
			}
			value, _ := cache.Get(tt.args.key)
			if bytes.Equal(value, tt.args.value) {

			}
		})
	}
}

func Test_GetCache(t *testing.T) {
	type args struct {
		key string
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
				key: "key2",
			},
			wantErr: true,
			wantVal: "",
			preExecute: func() {

			},
		},
		{
			name: "should return cached value for cache hit",
			args: args{
				key: "key3",
			},
			wantErr: false,
			wantVal: "data",
			preExecute: func() {
				_ = SetCacheWithoutExpiry("key3", []byte("data"))
			},
		},
	}
	Initialize()
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.preExecute()
			if value, err := GetCache(test.args.key); (err != nil) != test.wantErr || string(value) != test.wantVal {
				t.Errorf("GetCache() error = %v, wantErr %v, val = %v, wantVal = %v", err, test.wantErr, value, test.wantVal)
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
		wantVal    bigcache.Stats
		preExecute func()
	}{
		{
			name:    "should return empty status initially",
			args:    args{},
			wantErr: false,
			wantVal: bigcache.Stats{
				Hits:       0,
				Misses:     0,
				DelHits:    0,
				DelMisses:  0,
				Collisions: 0,
			},
			preExecute: func() {

			},
		},
		{
			name:    "should return status after usage",
			args:    args{},
			wantErr: false,
			wantVal: bigcache.Stats{
				Hits:       0,
				Misses:     0,
				DelHits:    0,
				DelMisses:  0,
				Collisions: 0,
			},
			preExecute: func() {
				_ = SetCacheWithoutExpiry("key1", []byte("value"))
			},
		},
		{
			name:    "should return status after set and get",
			args:    args{},
			wantErr: false,
			wantVal: bigcache.Stats{
				Hits:       1,
				Misses:     1,
				DelHits:    0,
				DelMisses:  0,
				Collisions: 0,
			},
			preExecute: func() {
				_ = SetCacheWithoutExpiry("key1", []byte("value"))
				_, _ = GetCache("key1")
				_, _ = GetCache("key2")
			},
		},
	}
	Initialize()
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.preExecute()
			value := getStatus()
			if value.Hits != test.wantVal.Hits || value.Misses != test.wantVal.Misses {
				t.Errorf("getStatus() val = %v, wantVal = %v", value, test.wantVal)
			}
		})
	}
}
func Test_clearAll(t *testing.T) {
	Initialize()
	key := "key1"
	expectedValue := []byte("value")
	SetCacheWithoutExpiry(key, expectedValue)
	cachedValue, _ := GetCache(key)
	if !bytes.Equal(cachedValue, expectedValue) {
		t.Errorf("Invalid cached value actual = %v expected = %v", cachedValue, expectedValue)
	}
	clearAll()
	_, err := GetCache(key)
	if err.Error() != "Entry not found" {
		t.Errorf("clearAll() error")
	}
}
