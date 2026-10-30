# 动效机制索引

观察目标后按行为查阅。以下是机制参考，不是目标参数或固定依赖；颜色、几何、幅度、节奏以实际录屏与测量为准。只加载需要的官方文档。

| 观察到的行为 | 可借鉴的机制 | 参考 |
| --- | --- | --- |
| 选中指示器移动、内容面板切换 | 测量位置/宽高，保留连续身份，退出后卸载 | [Animate UI Tabs](https://animate-ui.com/docs/primitives/radix-ui/tabs)、[Motion layout](https://motion.dev/docs/react-layout-animations) |
| 折叠、按压、滑块形变 | 内容高度与控件状态分别驱动，改目标时接续当前值 | [Accordion](https://animate-ui.com/docs/primitives/radix-ui/accordion)、[Switch](https://animate-ui.com/docs/primitives/radix-ui/switch) |
| 数字变化 | 先辨别逐位裁切滚动还是单数值插值，再保留格式与对齐 | [Sliding Number](https://animate-ui.com/docs/primitives/animate-ui/sliding-number)、[Number Ticker](https://magicui.design/docs/components/number-ticker) |
| 图标、文字错峰出现 | 子元素分轨，分别控制opacity/blur/transform与延迟 | [Split Text](https://reactbits.dev/text-animations/split-text)、[Text Generate](https://ui.aceternity.com/components/text-generate-effect) |
| 边框流光、节点间光线 | 遮罩限制覆盖区域；CSS路径或SVG渐变推进亮段与尾迹 | [Border Beam](https://magicui.design/docs/components/border-beam)、[Animated Beam](https://magicui.design/docs/components/animated-beam) |
| 持续跑马灯 | 重复轨道无缝衔接，方向/周期/暂停独立控制 | [Marquee](https://magicui.design/docs/components/marquee) |
| 指针吸引、倾斜 | 指针坐标映射与回弹；稳定外层保留点击区 | [Magnet](https://reactbits.dev/animations/magnet)、[3D Card](https://ui.aceternity.com/components/3d-card-effect) |
| 滚动显现与阅读轨迹 | 区分进入后定时播放和滚动进度驱动，绑定正确滚动容器 | [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal)、[Tracing Beam](https://ui.aceternity.com/components/tracing-beam) |
| 连续像素光场 | 确认确实需要Canvas/WebGL，再用时间/指针驱动场参数 | [Aurora](https://reactbits.dev/backgrounds/aurora) |

有限关键帧与两态变化通常可用CSS/WAAPI；React状态、布局、手势与弹簧可用[Motion](https://motion.dev/docs/react)；复杂序列可用[GSAP timeline](https://gsap.com/docs/v3/GSAP/Timeline/)。普通控件保留DOM语义，路径光效用SVG。使用前确认当前文档与依赖，参考案例不能证明目标采用了同一实现。
