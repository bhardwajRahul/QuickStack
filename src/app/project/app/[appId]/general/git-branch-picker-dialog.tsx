'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useDialogContext } from "@/frontend/states/dialog-context";
import { AppGitBranchesLookupModel } from "@/shared/model/app-source-info.model";
import { Check, GitBranch, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getGitBranches } from "./actions";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Actions } from "@/frontend/utils/nextjs-actions.utils";

export function GitBranchPickerDialog({
    appId,
    inputData,
    selectedBranch,
    onSelect,
}: {
    appId: string;
    inputData: AppGitBranchesLookupModel;
    selectedBranch?: string;
    onSelect: (branch: string) => void;
}) {
    const { closeDialog } = useDialogContext();
    const [branches, setBranches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBranches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await Actions.run(() => getGitBranches(appId, inputData));
            setBranches(result ?? []);
        } catch (err) {
            setBranches([]);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while loading branches.');
        }
        setIsLoading(false);
    }, [appId, inputData]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const selectBranch = (branch: string) => {
        onSelect(branch);
        closeDialog(branch);
    };

    return (<>
        <DialogHeader>
            <DialogTitle>Select Branch</DialogTitle>
            <DialogDescription>{inputData.gitUrl}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            {isLoading && (
                <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading branches...
                </div>
            )}

            {!isLoading && error && (
                <Alert variant="destructive">
                    <AlertTitle>Branches could not be loaded</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <p>{error}</p>
                        <Button type="button" variant="outline" onClick={loadBranches}>
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && (
                <Command>
                    <CommandInput placeholder="Search branches..." />
                    <CommandList>
                        <CommandEmpty>No branches found.</CommandEmpty>
                        <CommandGroup>
                            {branches.map((branch) => (
                                <CommandItem
                                    key={branch}
                                    value={branch}
                                    className="cursor-pointer"
                                    onSelect={() => selectBranch(branch)}
                                >
                                    <GitBranch className="mr-2 h-4 w-4" />
                                    <span className="truncate">{branch}</span>
                                    <Check className={branch === selectedBranch ? 'ml-auto h-4 w-4' : 'ml-auto h-4 w-4 opacity-0'} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            )}
        </div>
    </>);
}
