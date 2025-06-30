// Deployment types
export interface Dependency {
  environment: string;
  deployment_id: string;
}

export interface Dependent {
  environment: string;
  deployment_id: string;
}

export interface Deployment {
  deployment_id: string;
  status: string;
  project_id: string;
  region: string;
  environment: string;
  module: string;
  drift_detection: {
    enabled: boolean;
    interval: string;
    auto_remediate: boolean;
  };
  next_drift_check_epoch: number;
  initiated_by: string;
  epoch: number;
  job_id: string;
  module_version: string;
  module_type: string;
  module_track: string;
  variables: { [key: string]: any };
  dependencies: Dependency[];
  dependants: Dependent[];
  reference: string;
  error_text: string;
  output: object;
  has_drifted: boolean;
  policy_results: PolicyResult[];
}

export interface PolicyResult {
  policy: string;
  version: string;
  environment: string;
  description: string;
  policy_name: string;
  failed: boolean;
  violations: object;
}

// Module types
export interface Module {
  module: string;
  module_name: string;
  module_type: string;
  track: string;
  version: string;
  description: string;
  reference: string;
  timestamp: string;
  manifest: {
    spec: {
      examples: ModuleExample[];
    };
  };
  tf_variables: TfVariable[];
  tf_required_providers: TfRequiredProvider[];
  tf_lock_providers: TfLockProvider[];
  tf_outputs: TfOutput[];
  stack_data?: {
    modules: {
      module: string;
      version: string;
      s3_key: string;
      track: string;
    }[];
  };
  version_diff?: VersionDiff;
}

export interface ModuleExample {
  name: string;
  description: string;
  variables: object;
}

export interface TfVariable {
  name: string;
  type: string;
  default: any;
  description: string;
  nullable: boolean;
  sensitive: boolean;
}

export interface TfRequiredProvider {
  name: string;
  source: string;
  version: string;
}

export interface TfLockProvider {
  source: string;
  version: string;
}

export interface TfOutput {
  name: string;
  description: string;
  sensitive: boolean;
}

export interface VersionDiff {
  added: { path: string; value: string }[];
  changed: { path: string; old_value: string; new_value: string }[];
  removed: { path: string; value: string }[];
  previous_version: string;
}

// Policy types
export interface Policy {
  policy: string;
  version: string;
  description: string;
  reference: string;
  environment: string;
  timestamp: string;
  data: object;
}

// Project types
export interface Project {
  project_id: string;
  name: string;
  description: string;
  regions: string[];
  repositories?: RepositoryData[];
}

export interface RepositoryData {
  git_provider: string;
  git_url: string;
  repository_path: string;
  type: string;
}

// Merge Request types
// This interface is used for both GitLab merge requests and GitHub pull requests
export interface MergeRequestOptions {
  repositoryPath: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description?: string;
  filePath: string;
  fileContent: string;
  commitMessage: string;
}

export interface MergeRequest {
  web_url: string;
}
