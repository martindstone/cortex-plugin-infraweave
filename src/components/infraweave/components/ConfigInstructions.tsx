import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cortexapps/react-plugin-ui";
import { AlertCircle, ChevronDown, ChevronRight, Info } from "lucide-react";
import yaml from "js-yaml";
import { useEntityDescriptor } from "../../../hooks/useEntityDescriptor";

const ENTITY_TAG = "infraweave-plugin-config";

interface ConfigInstructionsProps {
  error?: Error;
}

const ConfigInstructions: React.FC<ConfigInstructionsProps> = ({ error }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [entityCreateError, setEntityCreateError] = useState<Error | null>(
    null,
  );
  const [userUrl, setUserUrl] = useState("");
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [urlValidated, setUrlValidated] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(
    null,
  );

  const {
    updateEntity,
    isMutating,
  } = useEntityDescriptor({
    entityTag: ENTITY_TAG,
    mutationMethod: "POST",
    onMutateSuccess: () => window.location.reload(),
    onMutateError: (err) => setEntityCreateError(err),
  });

  const handleValidateUrl = async () => {
    setIsCheckingUrl(true);
    setUrlValidationError(null);
    try {
      const testUrl = `${userUrl.replace(/\/$/, "")}/projects`;
      const res = await fetch(testUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setUrlValidated(true);
    } catch (err: any) {
      setUrlValidated(false);
      setUrlValidationError(`Could not validate URL: ${err.message}`);
    } finally {
      setIsCheckingUrl(false);
    }
  };

  const sampleYAML = `
openapi: 3.0.1
info:
  title: Infraweave Plugin Config
  x-cortex-tag: ${ENTITY_TAG}
  x-cortex-type: service
  x-cortex-custom-metadata:
    githubBaseUrl: https://api.github.com
    gitlabBaseUrl: https://gitlab.com/api/v4
    infraweaveBaseUrl: ${
    userUrl || "https://your-infraweave-app-host.domain.dom/api/v1"
  }
`.trim();

  const handleCreateEntity = () => {
    setEntityCreateError(null);
    try {
      const parsed = yaml.load(sampleYAML);
      if (typeof parsed !== "object" || !parsed) {
        throw new Error("Parsed YAML is not a valid object");
      }
      updateEntity(parsed);
    } catch (err) {
      setEntityCreateError(err as Error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Configure the InfraWeave Plugin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Enter your InfraWeave Base URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://your-infraweave-app-host.domain.dom/api/v1"
                value={userUrl}
                onChange={(e) => {
                  setUserUrl(e.target.value);
                  setUrlValidated(false);
                  setUrlValidationError(null);
                }}
                className="flex-1 px-3 py-2 rounded border bg-[var(--cortex-plugin-foreground)] text-[var(--cortex-plugin-primary)] placeholder:text-[var(--cortex-plugin-muted)]"
              />
              <Button
                onClick={handleValidateUrl}
                disabled={!userUrl || isCheckingUrl}
                size="sm"
              >
                {isCheckingUrl ? "Validating..." : "Validate URL"}
              </Button>
            </div>
            {urlValidated && (
              <div className="text-sm text-green-500">✅ URL validated</div>
            )}
            {urlValidationError && (
              <div className="text-sm text-red-500">{urlValidationError}</div>
            )}
          </div>

          <pre className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto whitespace-pre-wrap border">
            {sampleYAML}
          </pre>

          <div className="flex items-start gap-2 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>
              <strong>infraweaveBaseUrl</strong> is <strong>required</strong>
              {" "}
              and must point to your InfraWeave API endpoint.{" "}
              <strong>githubBaseUrl</strong> and <strong>gitlabBaseUrl</strong>
              {" "}
              are optional. If not provided, they default to the values shown
              above.
            </span>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleCreateEntity}
              disabled={!urlValidated || isMutating}
            >
              {isMutating ? "Creating..." : "Create InfraWeave Config Entity"}
            </Button>
            {entityCreateError && (
              <div className="mt-2 text-sm text-red-600">
                Error: {entityCreateError.message}
              </div>
            )}
          </div>

          {error && (
            <div className="pt-1">
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                {showDetails
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
                {showDetails ? "Hide" : "Show"} error details
              </button>
              {showDetails && (
                <div className="mt-2 p-3 rounded bg-gray-100 border text-sm text-gray-800 whitespace-pre-wrap">
                  {error.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigInstructions;
