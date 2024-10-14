# Group2 HW1

## 專案題目：NCCU MIS OJ
### 動機: 資管系考試或作業都沒有自己的 online judge 平台
- 大一程式設計、資料庫管理課程考試需要手寫程式碼
- 作業都需要交到 moodle 上，讓助教批改（助教都很久才改好）
- 大二資料結構需要在自己的電腦上 run 好之後抱著電腦給助教檢查
- 不懂程式 compile 的運作，想藉由寫 OJ 平台的過程慢慢學習

### 畫面
#### Wireframe
https://www.figma.com/design/NA082mffZVGf3jbnRe6d43/Wireframe?node-id=0-1&t=5zCkVl1aAePhw5Nz-1
![截圖 2024-10-14 晚上10.03.56](https://hackmd.io/_uploads/HJtR4i9yJl.png)
![截圖 2024-10-14 晚上10.04.32](https://hackmd.io/_uploads/Sk6lBscy1e.png)

### 核心功能
**1. 使用者管理與認證**
- 註冊與登入
- 使用者資料管理：基本的個人資料。
- **權限管理：** 不同使用者（如管理員、普通使用者）有不同權限，管理員可以管理題目、查看測試結果等。

**2. 題目管理**
- 創建與編輯題目：管理員可以添加、修改、刪除題目。每道題目包含問題描述、輸入輸出範例、test case、難度、deadline 等資訊。
- 題目分類：根據難度、課名分類題目。

**3. 程式碼與提交管理**
- 支援多程式語言：讓使用者可以選擇多種程式語言（如 C++、Python、Java等）。
- 編輯器：提供美觀的程式碼編輯器。
- 提交系統：使用者提交程式碼，系統可以處理並進行編譯。

**4. 測試與評分系統**
- 自動化測試：編譯和測試提交的 code，比對結果與正確答案。
- 評分機制：根據題目的得分標準進行評分，如按通過的測試數、時間和空間複雜度等。
- 即時回饋：提供測試結果的回饋（如正確、編譯錯誤、超時、記憶體超過等）。

**6. 紀錄與監控**
- 提交紀錄：記錄每次提交的程式碼和測試結果，以便追溯問題和提供反饋。
- 系統監控：監控系統資源使用情況，防止系統 overload。

### 架構圖
![Mind map](https://hackmd.io/_uploads/B1UEMgOyye.png)

![messageImage_1728918453775](https://github.com/user-attachments/assets/6381c04d-5273-476b-be58-700e929bc23f)



### 技術
#### 後端
- 程式語言：Node.js
- 版本：v20.17.0
- 框架：Express
- 工具：RabbitMQ, Docker, Git, AWS EC2
- 資料庫：PostgreSQL
#### 前端框架
- React

### 團隊合作

#### Branching Model: GitHub Flow

##### Repository 示意

- 共同遠端 repo
    - main
- fork 的個人遠端 repo
    - feature/OJ-1
    - feature/OJ-2
    - hotfix/OJ-1
- 本地端 repo
    - feature/OJ-1
    - feature/OJ-2
    - hotfix/OJ-1

##### 開發 Flow

當有人接到新的工作時，
- 分支創建：每次開發新功能或修正問題時，在本地端創建新的 feature 或 hotfix 分支 (Base on 共同遠端的 Main)，如 `feature/OJ-1` 和 `hotfix/OJ-1`。
- 開發：在本地 repo 中開發，並將修改 push 到個人的遠端 repo。
- Pull Request：當功能開發完成並通過測試後，向共同遠端 repo 的 main 分支發 PR。
- Code review：由其他組員檢查程式碼，最後合併至共同遠端 repo 的 main 分支。


### Trello 

#### 連結：
https://trello.com/invite/b/6707de9bf1131a633339dce9/ATTI7f42e93c35a5f0825671aa5e4ef237d3C0E13380/group2

#### 怎麼用這個工具進行專案管理
- 開發會分階段，每個階段會有一些功能
- 每個階段有自己的 **To Do**、**Doing** 和 **Done** 看板，例如 **Phase1 To Do**
- 每張卡片就是一個任務
- 任務包含：描述、負責人、截止日期、狀態 (ongoing, code review, PR merged) 和必要的附件
- 利用標籤來標示任務的類型、優先級或是緊急程度


### 固定開會時間
- 週四 9:00 p.m.

### 這次討論中遇到的問題
- 題目很難想，導致開會開了兩個小時
- 如果一個人過了 99 個 test case 但第 1 個 test case 沒有過，這樣是要給他 99 分還是 0 分？
