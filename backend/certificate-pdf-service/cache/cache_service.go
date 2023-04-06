package cache

import (
	"certificate-pdf/config"
	"github.com/coocood/freecache"
)

var cache *freecache.Cache

var NoExpiry = -1

type Stats struct {
	EvacuateCount     int64
	ExpiredCount      int64
	EntryCount        int64
	AverageAccessTime int64
	HitCount          int64
	MissCount         int64
	LookupCount       int64
	HitRate           float64
	OverwriteCount    int64
	TouchedCount      int64
}

func Initialize() {
	cacheSize := config.Config.CacheSize
	cache = freecache.NewCache(cacheSize)
}

func SetCacheWithoutExpiry(key []byte, value []byte) error {
	return cache.Set(key, value, NoExpiry)
}

func GetCache(key []byte) ([]byte, error) {
	return cache.Get(key)
}

func getStatus() Stats {
	return Stats{
		EvacuateCount:     cache.EvacuateCount(),
		ExpiredCount:      cache.ExpiredCount(),
		EntryCount:        cache.EntryCount(),
		AverageAccessTime: cache.AverageAccessTime(),
		HitCount:          cache.HitCount(),
		MissCount:         cache.MissCount(),
		LookupCount:       cache.LookupCount(),
		HitRate:           cache.HitRate(),
		OverwriteCount:    cache.OverwriteCount(),
		TouchedCount:      cache.TouchedCount(),
	}
}

func clearAll() {
	cache.Clear()
}
