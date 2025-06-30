import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInfraweaveContext } from '../contexts/InfraweaveConfigContext';
import { MergeRequest, MergeRequestOptions } from '../types';

// GitLab API hook with base URL from Infraweave context
export const useGitLabApi = () => {
  const { gitlabBaseUrl, isLoading, error } = useInfraweaveContext();

  const fetchUrl = (endpoint: string): string => {
    if (isLoading) throw new Error("GitLab API config is loading.");
    if (error) throw new Error(`GitLab API config error: ${error.message}`);
    if (!gitlabBaseUrl) throw new Error("GitLab base URL is not configured.");
    return gitlabBaseUrl.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, '');
  };

  const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = fetchUrl(endpoint);
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitLab API Error: ${response.status} ${response.statusText}\n${body}`);
    }

    return response.json();
  };

  const createBranch = async (repo: string | number, branch: string, ref: string) => {
    return request(`/projects/${repo}/repository/branches`, {
      method: 'POST',
      body: JSON.stringify({ branch, ref }),
    });
  };

  const createCommit = async (
    repo: string | number,
    branch: string,
    path: string,
    content: string,
    message: string
  ) => {
    return request(`/projects/${repo}/repository/commits`, {
      method: 'POST',
      body: JSON.stringify({
        branch,
        commit_message: message,
        actions: [
          {
            action: 'create',
            file_path: path,
            content,
          },
        ],
      }),
    });
  };

  const createMergeRequest = async ({
    repositoryPath, sourceBranch, targetBranch, title, description,
  }: MergeRequestOptions) => {
    return request<any>(`/projects/${repositoryPath}/merge_requests`, {
      method: 'POST',
      body: JSON.stringify({
        source_branch: sourceBranch,
        target_branch: targetBranch,
        title,
        description,
      }),
    });
  };

  const createMergeRequestWithFile = async (opts: MergeRequestOptions): Promise<MergeRequest> => {
    const { repositoryPath, sourceBranch, targetBranch, filePath, fileContent, commitMessage } = opts;
    await createBranch(repositoryPath, sourceBranch, targetBranch);
    await createCommit(repositoryPath, sourceBranch, filePath!, fileContent!, commitMessage!);
    const mr = await createMergeRequest(opts);
    return {
      web_url: mr.web_url ?? 'unknown',
    };
  };

  return {
    isLoading,
    createBranch,
    createCommit,
    createMergeRequestWithFile,
  };
};

// React Query hook to create GitLab MR with file
export const useCreateGitLabMergeRequest = () => {
  const { createMergeRequestWithFile, isLoading } = useGitLabApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: MergeRequestOptions) => {
      if (isLoading) throw new Error("GitLab API not ready");
      return createMergeRequestWithFile(options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gitlab', 'merge-requests'] });
    },
    onError: (e) => console.error('Error creating GitLab MR:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};

// React Query hook to create GitLab branch
export const useCreateGitLabBranch = () => {
  const { createBranch, isLoading } = useGitLabApi();

  const mutation = useMutation({
    mutationFn: ({ repositoryPath, branchName, ref }: {
      repositoryPath: string | number;
      branchName: string;
      ref: string;
    }) => {
      if (isLoading) throw new Error("GitLab API not ready");
      return createBranch(repositoryPath, branchName, ref);
    },
    onError: (e) => console.error('Error creating GitLab branch:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};

// React Query hook to create GitLab commit
export const useCreateGitLabCommit = () => {
  const { createCommit, isLoading } = useGitLabApi();

  const mutation = useMutation({
    mutationFn: ({ repositoryPath, branchName, filePath, fileContent, commitMessage }: {
      repositoryPath: string | number;
      branchName: string;
      filePath: string;
      fileContent: string;
      commitMessage: string;
    }) => {
      if (isLoading) throw new Error("GitLab API not ready");
      return createCommit(repositoryPath, branchName, filePath, fileContent, commitMessage);
    },
    onError: (e) => console.error('Error creating GitLab commit:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};
