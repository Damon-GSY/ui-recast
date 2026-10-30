# MenuFold motion review — lists / style cards

完成：2026-10-30。源文件已于 **11:41:37 Asia/Shanghai 冻结**；之后只写证据与本文档。可集成。

## 具体结果

- **EventList 修复**：新增卡片原来仅 scale .98 淡入，旧行整行跳位。改为 scale 0→1 的均匀缩放/淡入，独立 position-only 外层平滑让位；拟合 spring 420/46。参考没有可确认过冲，未凭空补弹跳。初始全部可见、status 不重播、已知 ID 恢复/普通重排立即呈现均保留。
- **SelectableCards 修复**：两个 shared-layout 背景层的 opacity 竞争，快速横移的可见合成透明度跌至约 .059。改成每组一个背景层，平移/改尺寸与透明度分别控制；快速反向延续当前画面。所有卡片文字始终在其上方。勾选已有淡入淡出，无证据支持额外 pop。
- **NumberTicker：无新增缺陷，不改源码。** 数值插值、当前值立即显示、search instant、快速改目标与 reduced motion 正确。默认 .65s 与源站约3s的回放节奏不同，明确记录，不称曲线一致。
- **PartitionList：无新增缺陷，不改源码。** accepted 移动和中途 accepted 返回连续，轻微过冲存在；text scale=1。pending/rejected 不改变分区。

## 交付文件

仅四个组件源码文件修改：

- `src/components/event-list.tsx`
- `src/components/event-list.css`
- `src/components/selectable-cards.tsx`
- `src/components/selectable-cards.css`

四项 `evidence/batch/<slug>/analysis.md` 已更新；每项 `motion-review/before/` 保存原 TSX/CSS、Study、原分析和 replica 录像，未重复复制整份 reference 视频。`motion-review/source-freeze.json` 记录源文件路径、大小和修改时间，没有摘要/哈希。

受影响的 canonical 证据已更新：

- [EventList lifecycle](../../evidence/batch/event-list/replica/lifecycle.webm) · [实际阶段帧](../../evidence/batch/event-list/replica/keyframes/contact.png)
- [SelectableCards lifecycle](../../evidence/batch/selectable-cards/replica/lifecycle.webm) · [实际阶段帧](../../evidence/batch/selectable-cards/replica/keyframes/contact.png)

Ticker/Partition 原完整录像仍为 canonical，未为无缺陷项重录。四项完整原片已解码，前后整段联系表及真实连续帧位于各项 `motion-review/`。新的两段视频分别解码 230、204 帧；非插帧。帧时间为原生25fps帧索引的导航时间，当前FFmpeg未返回精确PTS，不作亚帧峰值结论。

## 已完成验证

独立 `4216` 预览，关闭 HMR，录制与密集采样分开；一次只录一个组件。初始值/立即搜索、事件新 ID 入场/状态不重播/快速连续新增/清空中断、分区 pending/failure/success/accepted 返回、样式卡快速反向/不遮文字/hover 不选中/键盘跳过禁用/原生 form 值/reduced motion 均已检查。相关 Chrome 检查和最终 TypeScript no-emit 通过。新录像的完整序列、入口/中间/收敛/退出/反向帧已用 view_image 查看。没有把编译通过写成视觉通过。

重现工具：`scripts/menufold-review/lists-preview.mjs`、`lists-inspect.mjs`、`lists-verify.mjs`、`lists-cards-verify.mjs`、`lists-cards-reference.mjs`、`lists-record.mjs`、`lists-frames.mjs`。现有校验脚本中 EventList 的运动采样目标需要指向新外层内的 `.mf-event-list__row`；本组新脚本已调整。

## 给主任务的 skill 建议

1. 列表新增需同时看新项和既有行；单看新项淡入会漏掉旧行瞬移。布局投影和卡片自身缩放分层，避免文字被非均匀拉伸。
2. “pop”不自动等于过冲。这里源卡片接近单调增长；按实际曲线判断，不能为了动感新增峰值。
3. shared-layout/AnimatePresence 的进出层需检查合成透明度与所有兄弟卡片的层级；不能仅检查目标层 opacity 或终态。快速 A→B→A 与稳定 A→B 都要成立。
4. 公开页面标题/文档说有 hover，不等于此次实际预览渲染了 hover。此次源站没有对应元素，因此把本地连续性修复与原版曲线等价分开报告。

## 集成边界与余差

未编辑 shared gallery/player、skill、registry、bundle、根文档、package/deps/public。主任务可生成分发产物；本组不重跑根 build。保留每项 analysis 中具体静态/产品差异。尤其 SelectableCards 的当前源录屏与补充 DOM 观察未给出背景运动，不能据此声称源站曲线复刻通过。
