export interface Tag {
  id: number;
  name: string;
}

export interface Prompt {
  id: number;
  title: string;
  body: string;
  created_at: string;
  tags: Tag[];
}

export interface PromptFormData {
  title: string;
  body: string;
  tags: string[];
}
