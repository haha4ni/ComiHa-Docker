package main

import (
	"fmt"
	"net/http"
	"os"
)

// API Handler
func apiHello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello from Go backend!")
}

func main() {
	// 提供 API
	http.HandleFunc("/api/hello", apiHello)

	// 判斷 dist 路徑：先用容器內的 ./frontend/dist，如果不存在再用本機開發的 ../frontend/dist
	distPath := "./frontend/dist"
	if _, err := os.Stat(distPath); os.IsNotExist(err) {
		distPath = "../frontend/dist"
	}

	// 提供 React 靜態檔案
	fs := http.FileServer(http.Dir(distPath))
	http.Handle("/", fs)

	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}