import type { ReactNode } from 'react';
import { ReadingTabs } from '../../components/reading-tabs';

export type ReadingWorkspaceProps = {
  title: string;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  renderArticle: () => ReactNode;
  renderAnnotations: () => ReactNode;
  renderSources: () => ReactNode;
  keepMounted?: boolean;
};

/** Application-provided renderers can contain its own loader/editor; tabs do not invent a transport. */
export function ReadingWorkspace({ title, selectedSection, onSectionChange, renderArticle,
  renderAnnotations, renderSources, keepMounted = true }: ReadingWorkspaceProps) {
  return <section aria-label={title}>
    <h2>{title}</h2>
    <ReadingTabs label={`${title} sections`} value={selectedSection} onValueChange={onSectionChange} keepMounted={keepMounted} tabs={[
      { value: 'article', label: 'Article', render: renderArticle },
      { value: 'annotations', label: 'Annotations', render: renderAnnotations },
      { value: 'sources', label: 'Sources', render: renderSources },
    ]}/>
  </section>;
}
