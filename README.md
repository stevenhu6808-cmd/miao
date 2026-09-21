# RaidMate Community

请帮我开发一个专业级的 Pokémon GO 实时组队、战术辅助与玩家互动社区网页系统。



界面风格与语言要求：

- 风格：现代暗黑系科技风格（Dark Mode），响应式移动端优先设计，包含炫酷的卡片视觉效果与微动画。

- 语言支持：顶部导航栏必须包含【多语言切换下拉菜单（Language Switcher）】，支持中文 (Chinese)、英文 (English)、日语 (日本語) 和韩语 (한국어) 四种语言自由无缝切换，界面所有文字、按钮和提示需完全匹配所选语言。



核心功能模块要求：



1. 玩家身份与角色系统：

   - 玩家资料卡：支持设置训练家名称、游戏代号、好友代码（支持一键复制）及玩家等级。

   - 特殊权限识别：默认管理员账号为 wudi0693（具备最高管理权限，可清理违规房间与动态）。

   - VIP 权限：支持 VIP 标记，VIP 玩家享有【优先排队插队】和创建高级专属房间的权限。



2. 团战打房排队系统（核心：区分【远程团战】与【现场近卡团战】）：

   - 创建房间功能：

     * 房主/管理员可创建组队房间，支持选择或【自定义 Boss 名字、战力 CP、属性、剩余时间】。

     * 必须选择【团战模式】：

       1. 【远程团战模式（Remote Raid）】：房主人在道馆现场，房主复制房间内所有排队队员的好友代码并加为好友，在游戏内发送远程邀请函拉队员进场。

       2. 【现场/近卡团战模式（Local / Near Raid）】：所有人都在道馆附近现场，系统自动生成/显示【游戏内私房组队密码（例如：皮卡丘-妙蛙种子-小火龙）】，现场玩家根据密码进入同一个私房打卡。

   - 房间排队与管理逻辑：

     * 显示实时排队队列（Queue），支持普通排队与 VIP 优先排队。

     * 房主/管理员功能：可设置发车人数上限（如 5人、10人），具备【一键踢人】、【一键复制全员好友码】及【一键发车/解散房间】功能。

     * 队员功能：一键复制房主的好友代码（方便远程模式添加房主），并有【已准备 / 取消排队】按钮。



3. 炫耀墙 / 闪光战绩动态社区（类似 Facebook / 朋友圈）：

   - 动态卡片流：玩家可以发布战绩，展示捕捉到的闪光宝可梦（Shiny）、百变怪、暗影宝可梦或 100IV 宝可梦卡片。

   - 发布内容：支持上传/展示宝可梦截图图片、文字描述、捕捉地点及 IV 属性。

   - 社交互动：像 Facebook / 朋友圈一样，每条动态下方提供【点赞 (Like)】与【评论 (Comment)】功能，点击可展开查看评论列表并发表留言。

   - 动态流支持平滑滚动与实时刷新。



4. 简易 IV / LV / 战力计算助手：

   - 提供快捷的宝可梦 IV（攻击/防御/体力）、等级（LV）及进化 CP 估算计算工具卡片。



5. 悬浮窗模式与一键启动游戏（移动端优化）：

   - 页面底部固定快捷工具栏，提供【启动 Pokémon GO】和【开启悬浮工具助手】快捷按钮。

   - 支持全局一键复制好友码，兼容 Android 悬浮窗与 iOS 快速切屏模式。



请一次性生成完整的 UI 界面与交互逻辑，并在顶部保留多语言切换控件，右侧直接展示成品！

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cee527cf-5a9f-585b-a64b-16ea244b65a6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
