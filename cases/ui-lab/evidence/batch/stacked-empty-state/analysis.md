# Stacked Empty State — 动效复查与参考配色校准

2026-10-30。来源：[Aceternity Pro](https://ui.aceternity.com/blocks/empty-states/empty-state-with-stacked-cards) · [公开渲染预览](https://ui.aceternity.com/live-preview/empty-state-with-stacked-cards)。仅使用画面、可见DOM、computed style和渲染轨迹，无受限源码或打包脚本。

## 完整证据

- [原版完整录像](reference/lifecycle.webm)：19.00s，包含入场、三卡悬停、离开、重复与中途切换。
- [当前完整录像](replica/lifecycle.webm)：颜色校准后单次重录13.56s，1100×1000，原速度；包含键盘操作、Rules/Groups/Stash内容变更与显式重播。上轮13.88s录像保存在[color-review/before/replica](color-review/before/replica/lifecycle.webm)。
- [修复前完整录像](motion-review/before/replica/lifecycle.webm)；同目录保留原源码和分析。
- [原版中间帧](reference/transitions-keyframes.png) · [修复后中间帧](replica/transitions-keyframes.png)。同名JSON记录请求时间与实际解码时间；actions时间不直接当作动画相位。
- [渲染测量比较](motion-review/motion-comparison.json) · [交互验证](motion-review/verification.json)。密集测量与录像分开。

## 发现与修正

原版中心卡先出现，两侧从直立向±10°扇出，随后稳定；hover仅轻微放大到1.02，角度、阴影和层级不变，没有连续闲置循环。图像/图标随卡片运动，标题说明保持静止，光影为常驻纸面层。

旧版左/中/右入场次序、18°起始倾斜与0.92缩放不符。改为中心先出现、两侧延迟100ms，从直立进入；300/22弹簧为渲染拟合。测得侧卡入场间隔约原版83ms/本地100ms，旋转峰值约10.763°/10.753°。中心竖向过冲约1.53px/0.75px，仍有差异。

首次入场延迟原来误用于hover，右卡响应约130ms；scale独立后约11–13ms开始响应。保持1.02放大，不增加移动光晕或旋转。三种内容变更保留同一组卡片，显式Replay才重建；根元素增加border-box，独立容器窄屏不溢出。

图标几何、纸面静态高光和阴影已对照。保留用户指定的原创SVG和紧凑纸面绘制，未将它们伪称原版网页缩略图。实际采样为25fps，不能据此确定更精确的峰值时间。

## 接口和验证

`StackedEmptyState` 接收 `kind`、标题/描述、单个 `actionLabel/onAction`、`disabled`、可选三个图标和className。卡片装饰性、aria-hidden且不可聚焦；业务动作由调用方持有。

13项浏览器检查通过，0页面异常：三种内容保留表面、键盘回调、单个主要操作、禁用、文字不跟随hover变形、390px布局、reduced motion及重播。父任务真实registry重装、独立构建与安装后的窄屏CSS增量检查通过。构建不作为视觉一致的证据。

## 参考配色校准（2026-10-30，源码已冻结）

旧暖灰/橄榄色为代理自行添加，非用户批准。查看原版真实settled/hover截图，再从公开预览测量computed style。白卡片 `#fff`；面板 `oklch(.967 .003 264.542)`（约 `#f3f4f6`）；页面 `#f5f5f5`；正文 `oklch(.439 0 0)`（约 `#525252`）；黑色强调；主按钮/焦点 `oklch(.623 .214 259.815)`（约 `#2b7fff`）。hover保持同一蓝色，深蓝内阴影由.2/10px增强为.4/20px。阴影改为黑色.1；去除黄绿纸面渐变、彩色ambient和每种图标的自创色相。

原创SVG改为中性 `#525252`，装饰线/点 `#d4d4d4`，边框 `#e5e5e5`，静态高光保持白色。这些是紧凑绘制的语义补充，未伪称原版资产。禁用态为可读的中性灰；组件本身无selected/error/success状态。独立CSS承载全部颜色，Study包装也已中性化。

[精确颜色与来源](color-review/reference-colors.json) · [检查结果](color-review/validation.json) · [改色前源码/截图/媒体](color-review/before/) · [各状态截图](color-review/after/)。三种内容、hover、键盘焦点/回调、disabled、390px无溢出及移除Study CSS后的独立颜色检查通过，0页面异常。两个TSX均与基线完全一致。已查看最终截图、实际录像解码帧，中心先入场和静态清晰线条保留。本轮只重录原生命周期一次，不重复完整动效审计。注册表安装、构建及集成由父任务处理。

完整映射、变更文件和交付记录：`notes/menufold-color/stack.md`。

## 剩余差异

保留用户指定原创SVG、紧凑矩形、较小阴影几何、不同字体与单操作布局；原版网页照片的下缘渐隐不适用于这些原生图标。装饰线、边框、禁用态和Study控件颜色是中性语义补充。参考蓝色/白字的平色对比度约3.76:1，本轮保持实测蓝色；正文约7.10:1、禁用文字约6.20:1。中心竖向过冲幅度不同，参数为上轮拟合；未重审原版移动端和隐藏变体，不声称1:1。
