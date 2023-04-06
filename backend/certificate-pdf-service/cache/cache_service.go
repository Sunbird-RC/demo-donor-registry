package cache

import (
	"context"
	"github.com/allegro/bigcache/v3"
	log "github.com/sirupsen/logrus"
)

var cache *bigcache.BigCache

func Initialize() {
	cache, _ = bigcache.New(context.Background(), bigcache.DefaultConfig(1<<63-1))

}

func SetCacheWithoutExpiry(key string, value []byte) error {
	return cache.Set(key, value)
}

func GetCache(key string) ([]byte, error) {
	return cache.Get(key)
}

func getStatus() bigcache.Stats {
	return cache.Stats()
}

func clearAll() {
	err := cache.Reset()
	if err != nil {
		log.Error("Error while clearing cache", err)
		return
	}
}
