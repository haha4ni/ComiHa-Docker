# 專案使用說明

本專案包含 **React 前端** 與 **Go 後端**，可選擇單獨執行或使用 Docker。

---

## 前端 (React with Vite)

### 1. 安裝依賴

```bash
cd frontend
npm install
```

### 2. 建立靜態檔案 (Production Build)

```bash
cd frontend
npm run build
```

此時會在 `frontend/dist` 生成靜態檔案，後端會用來提供 React 首頁。

### 3. 動態開發模式 (Vite Dev Server)

```bash
cd frontend
npm run dev
```

Vite 預設會啟動在 [http://localhost:5173](http://localhost:5173)。

⚠️ 注意：這個模式下 React 直接由 Vite 提供，後端 API ([http://localhost:8080/api/hello](http://localhost:8080/api/hello)) 仍然可以獨立存取。

---

## 後端 (Go)

### 執行後端 (需先 build 前端或動態用 Vite)

```bash
cd backend
go run main.go
```

後端會：

* 提供 React 首頁： [http://localhost:8080/](http://localhost:8080/)
* 提供 API： [http://localhost:8080/api/hello](http://localhost:8080/api/hello)

---

## Docker 部署

### 1. 建立 Docker 映像檔

```bash
docker compose build
```

### 2. 啟動容器

```bash
docker compose up
```

容器啟動後：

* React 首頁： [http://localhost:8080/](http://localhost:8080/)
* Go API： [http://localhost:8080/api/hello](http://localhost:8080/api/hello)
