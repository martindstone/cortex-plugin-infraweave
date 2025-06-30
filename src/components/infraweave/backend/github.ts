import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInfraweaveContext } from '../contexts/InfraweaveConfigContext';
import { MergeRequest, MergeRequestOptions } from '../types';

// GitHub API hook with base URL from Infraweave context
export const useGitHubApi = () => {
  const { githubBaseUrl, isLoading, error } = useInfraweaveContext();

  const fetchUrl = (endpoint: string): string => {
    if (isLoading) throw new Error("GitHub API config is loading.");
    if (error) throw new Error(`GitHub API config error: ${error.message}`);
    if (!githubBaseUrl) throw new Error("GitHub base URL is not configured.");
    return githubBaseUrl.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, '');
  };

  const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = fetchUrl(endpoint);
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}\n${body}`);
    }

    return response.json();
  };

  const getBranchSHA = async (repo: string, branch: string): Promise<string> => {
    const data = await request<{ object: { sha: string } }>(
      `/repos/${repo}/git/ref/heads/${branch}`
    );
    return data.object.sha;
  };

  const createBranch = async (repo: string, branchName: string, ref: string) => {
    const sha = await getBranchSHA(repo, ref);
    return request(`/repos/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    });
  };

  const createCommit = async (
    repo: string,
    branch: string,
    path: string,
    content: string,
    message: string
  ) => {
    const contentBase64 = btoa(content);
    return request(`/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch,
      }),
    });
  };

  const createPullRequest = async ({
    repositoryPath, sourceBranch, targetBranch, title, description,
  }: MergeRequestOptions) => {
    return request<any>(`/repos/${repositoryPath}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        head: sourceBranch,
        base: targetBranch,
        body: description,
      }),
    });
  };

  const createPullRequestWithFile = async (opts: MergeRequestOptions): Promise<MergeRequest> => {
    const { repositoryPath, sourceBranch, targetBranch, filePath, fileContent, commitMessage } = opts;
    await createBranch(repositoryPath, sourceBranch, targetBranch);
    await createCommit(repositoryPath, sourceBranch, filePath!, fileContent!, commitMessage!);
    const pr = await createPullRequest(opts);
    return {
      web_url: pr.html_url ?? pr._links?.html?.href ?? 'unknown',
    };
  };

  return {
    isLoading,
    createBranch,
    createCommit,
    createPullRequestWithFile,
  };
};

// React Query hook to create GitHub PR with file
export const useCreateGitHubPullRequest = () => {
  const { createPullRequestWithFile, isLoading } = useGitHubApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: MergeRequestOptions) => {
      if (isLoading) throw new Error("GitHub API not ready");
      return createPullRequestWithFile(options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github', 'pull-requests'] });
    },
    onError: (e) => console.error('Error creating GitHub PR:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};

// React Query hook to create GitHub branch
export const useCreateGitHubBranch = () => {
  const { createBranch, isLoading } = useGitHubApi();

  const mutation = useMutation({
    mutationFn: ({ repositoryPath, branchName, ref }: {
      repositoryPath: string;
      branchName: string;
      ref: string;
    }) => {
      if (isLoading) throw new Error("GitHub API not ready");
      return createBranch(repositoryPath, branchName, ref);
    },
    onError: (e) => console.error('Error creating GitHub branch:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};

// React Query hook to create GitHub commit
export const useCreateGitHubCommit = () => {
  const { createCommit, isLoading } = useGitHubApi();

  const mutation = useMutation({
    mutationFn: ({ repositoryPath, branchName, filePath, fileContent, commitMessage }: {
      repositoryPath: string;
      branchName: string;
      filePath: string;
      fileContent: string;
      commitMessage: string;
    }) => {
      if (isLoading) throw new Error("GitHub API not ready");
      return createCommit(repositoryPath, branchName, filePath, fileContent, commitMessage);
    },
    onError: (e) => console.error('Error creating GitHub commit:', e),
  });

  return {
    ...mutation,
    ready: !isLoading,
  };
};
