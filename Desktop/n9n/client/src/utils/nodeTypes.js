import CustomNode from '../components/CustomNode';

export const nodeTypes = {
  webhook: CustomNode,
  httpRequest: CustomNode,
  slack: CustomNode,
  email: CustomNode,
  delay: CustomNode,
  condition: CustomNode,
  code: CustomNode,
  cron: CustomNode,
  notion: CustomNode,
  airtable: CustomNode
}; 