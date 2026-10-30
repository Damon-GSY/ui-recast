import { ToolCallCard, type ToolCallCardProps } from '../../components/tool-call-card';
import type { ReactNode } from 'react';

export type ToolCallRecord = Pick<ToolCallCardProps, 'name' | 'summary' | 'icon' | 'status' | 'args' | 'result' | 'error' | 'duration'> & { id: string };
export type ToolCallLogProps = {
  calls: readonly ToolCallRecord[];
  expandedIds: readonly string[];
  onExpandedChange: (id: string, open: boolean) => void;
  renderToolContent?: (call: ToolCallRecord) => ReactNode;
  onCopy?: ToolCallCardProps['onCopy'];
};

/** Real React integration boundary: application supplies records, expansion, and optional content. */
export function ToolCallLog({ calls, expandedIds, onExpandedChange, renderToolContent, onCopy }: ToolCallLogProps) {
  return <div style={{ display: 'grid', gap: 8 }}>
    {calls.map(({ id, ...call }) => <ToolCallCard key={id} {...call} open={expandedIds.includes(id)}
      onOpenChange={open => onExpandedChange(id, open)} onCopy={onCopy}>
      {renderToolContent?.({ id, ...call })}
    </ToolCallCard>)}
  </div>;
}
