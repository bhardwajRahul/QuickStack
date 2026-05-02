'use client';

import { SubmitButton } from "@/components/custom/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormUtils } from "@/frontend/utils/form.utilts";
import { AppBuildMethod, AppGitBranchesLookupModel, AppSourceInfoInputModel, appSourceInfoInputZodModel } from "@/shared/model/app-source-info.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { saveGeneralAppSourceInfo } from "./actions";
import { useFormState } from "react-dom";
import { ServerActionResult } from "@/shared/model/server-action-error-return.model";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateOrRegenerateGitSshKey } from "./actions";
import { ClipboardCopy, FileCode2, GitBranch, Info, KeyRound, Link as LinkIcon, LockKeyhole, Package, RefreshCw, User, type LucideIcon } from "lucide-react";
import { useConfirmDialog, useDialog } from "@/frontend/states/zustand.states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Actions } from "@/frontend/utils/nextjs-actions.utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { GitBranchPickerDialog } from "./git-branch-picker-dialog";
import { cn } from "@/frontend/utils/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const repoUrlRequiredMessage = "Enter a Git repository URL first.";

export default function GeneralAppSource({ app, readonly, gitSshPublicKey }: {
    app: AppExtendedModel;
    readonly: boolean;
    gitSshPublicKey?: string;
}) {
    const [publicKey, setPublicKey] = useState(gitSshPublicKey);
    const [isPublicKeyDialogOpen, setIsPublicKeyDialogOpen] = useState(false);
    const { openConfirmDialog } = useConfirmDialog();
    const { openDialog } = useDialog();
    const form = useForm<AppSourceInfoInputModel>({
        resolver: zodResolver(appSourceInfoInputZodModel),
        defaultValues: {
            ...app,
            sourceType: app.sourceType as 'GIT' | 'GIT_SSH' | 'CONTAINER',
            buildMethod: (app.buildMethod as AppBuildMethod | undefined) ?? 'RAILPACK',
            dockerfilePath: app.dockerfilePath ?? './Dockerfile',
        },
        disabled: readonly,
    });

    const [state, formAction] = useFormState((state: ServerActionResult<any, any>, payload: AppSourceInfoInputModel) => saveGeneralAppSourceInfo(state, payload, app.id), FormUtils.getInitialFormState<typeof appSourceInfoInputZodModel>());
    useEffect(() => {
        if (state.status === 'success') {
            toast.success('Source Info Saved', {
                description: "Click \"deploy\" to apply the changes to your app.",
            });
        }
        FormUtils.mapValidationErrorsToForm<typeof appSourceInfoInputZodModel>(state, form)
    }, [state]);

    const sourceTypeField = form.watch();
    const hasGitUrl = !!sourceTypeField.gitUrl?.trim();
    const previousGitUrl = useRef(sourceTypeField.gitUrl);
    useEffect(() => {
        if (previousGitUrl.current !== sourceTypeField.gitUrl) {
            form.setValue('gitBranch', '', {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
        previousGitUrl.current = sourceTypeField.gitUrl;
    }, [form, sourceTypeField.gitUrl]);

    const copyPublicKey = () => {
        if (!publicKey) {
            return;
        }
        navigator.clipboard.writeText(publicKey);
        toast.success('Copied to clipboard.');
    };
    const generateKey = async () => {
        if (!hasGitUrl) {
            toast.error(repoUrlRequiredMessage);
            return;
        }
        if (publicKey) {
            const confirmed = await openConfirmDialog({
                title: "Regenerate SSH Key",
                description: "This replaces the current app SSH key. Update the deploy key in your git provider before deploying again.",
                okButton: "Regenerate",
            });
            if (!confirmed) {
                return;
            }
        }

        const result = await Actions.run(() => generateOrRegenerateGitSshKey(app.id));
        setPublicKey(result);
        setIsPublicKeyDialogOpen(true);
        toast.success('SSH key generated', {
            description: 'Add the public key as a deploy key in your git provider.',
        });
    };
    const openBranchDialog = (sourceType: 'GIT' | 'GIT_SSH') => {
        const values = form.getValues();
        const inputData: AppGitBranchesLookupModel = sourceType === 'GIT'
            ? {
                sourceType,
                gitUrl: values.gitUrl ?? '',
                gitUsername: values.gitUsername,
                gitToken: values.gitToken,
            }
            : {
                sourceType,
                gitUrl: values.gitUrl ?? '',
            };

        openDialog(
            <GitBranchPickerDialog
                appId={app.id}
                inputData={inputData}
                selectedBranch={values.gitBranch ?? ''}
                onSelect={(branch) => form.setValue('gitBranch', branch, {
                    shouldDirty: true,
                    shouldValidate: true,
                })}
            />,
            '520px'
        );
    };

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Source</CardTitle>
                <CardDescription>Provide Information about the Source of your Application.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form action={(e) => form.handleSubmit((data) => {
                    return formAction(data);
                })()}>
                    <CardContent className="space-y-4">
                        <div className="hidden">
                            <FormField
                                control={form.control}
                                name="sourceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source Type</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value as string | number | readonly string[] | undefined} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Label>Source Type</Label>
                        <Tabs defaultValue="GIT" value={sourceTypeField.sourceType} onValueChange={(val) => {
                            if (val !== sourceTypeField.sourceType && (val === 'GIT' || val === 'GIT_SSH' || sourceTypeField.sourceType === 'GIT' || sourceTypeField.sourceType === 'GIT_SSH')) {
                                form.setValue('gitBranch', '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }
                            form.setValue('sourceType', val as 'GIT' | 'GIT_SSH' | 'CONTAINER');
                        }} className="mt-2">

                            <ScrollArea>
                                <TabsList>
                                    {app.appType === 'APP' && <TabsTrigger value="GIT"><GitBranch className="mr-2 h-4 w-4" />Git HTTPS</TabsTrigger>}
                                    {app.appType === 'APP' && <TabsTrigger value="GIT_SSH"><KeyRound className="mr-2 h-4 w-4" />Git SSH</TabsTrigger>}
                                    <TabsTrigger value="CONTAINER"><Package className="mr-2 h-4 w-4" />Docker Container</TabsTrigger>
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            <TabsContent value="GIT" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="gitUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Git Repo URL</FormLabel>
                                            <FormControl>
                                                <IconInput icon={LinkIcon} placeholder="https://github.com/user/repo.git"
                                                    {...field} value={field.value as string | number | readonly string[] | undefined} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid md:grid-cols-2 gap-4">


                                    <FormField
                                        control={form.control}
                                        name="gitUsername"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Git Username (optional)</FormLabel>
                                                <FormControl>
                                                    <IconInput icon={User} {...field} value={field.value as string | number | readonly string[] | undefined} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gitToken"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Git Token (optional)</FormLabel>
                                                <FormControl>
                                                    <IconInput icon={LockKeyhole} type="password" {...field} value={field.value as string | number | readonly string[] | undefined} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gitBranch"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Git Branch</FormLabel>
                                                <FormControl>
                                                    <RepoUrlRequiredTooltip active={!hasGitUrl}>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full justify-start"
                                                            disabled={field.disabled || !hasGitUrl}
                                                            onClick={() => openBranchDialog('GIT')}
                                                        >
                                                            <GitBranch className="h-4 w-4" />
                                                            <span className="truncate">{field.value || 'Select Branch'}</span>
                                                        </Button>
                                                    </RepoUrlRequiredTooltip>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="buildMethod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Build Method</FormLabel>
                                                <Select
                                                    disabled={field.disabled || !hasGitUrl}
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <RepoUrlRequiredTooltip active={!hasGitUrl}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select build method" />
                                                            </SelectTrigger>
                                                        </RepoUrlRequiredTooltip>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="RAILPACK">detect automatically (using railpack)</SelectItem>
                                                        <SelectItem value="DOCKERFILE">Dockerfile</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {sourceTypeField.buildMethod === 'DOCKERFILE' && (<>
                                        <div></div>
                                        <FormField
                                            control={form.control}
                                            name="dockerfilePath"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Path to Dockerfile</FormLabel>
                                                <FormControl>
                                                        <IconInput icon={FileCode2} placeholder="./Dockerfile" {...field} value={field.value as string | number | readonly string[] | undefined} disabled={field.disabled || !hasGitUrl} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                    </>)}
                                </div>

                            </TabsContent>
                            <TabsContent value="GIT_SSH" className="space-y-4 mt-4">

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>SSH access requires a known key</AlertTitle>
                                    <AlertDescription>
                                        Git providers like GitHub require an accepted SSH key for SSH clone URLs, even for public repositories. Generate keys and add the public key as a deploy key, or use HTTPS for anonymous public clones.
                                    </AlertDescription>
                                </Alert>
                                <FormField
                                    control={form.control}
                                    name="gitUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Git SSH Repo URL</FormLabel>
                                            <FormControl>
                                                <IconInput icon={LinkIcon} placeholder="git@github.com:user/repo.git" {...field} value={field.value as string | number | readonly string[] | undefined} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    {!readonly && <div className="space-y-2">
                                        <Label>SSH Key Authentication</Label>
                                        <div className="flex items-center gap-2">
                                            {publicKey && <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsPublicKeyDialogOpen(true)}
                                                disabled={!publicKey}
                                            >
                                                <KeyRound />
                                                Show Public SSH Key
                                            </Button>}
                                            <RepoUrlRequiredTooltip active={!hasGitUrl}>
                                                <Button type="button" variant="secondary" onClick={generateKey} disabled={!hasGitUrl}>
                                                    {publicKey ? <RefreshCw /> : <KeyRound />}
                                                    {publicKey ? <span className="hidden md:block">Regenerate</span> : 'Generate SSH Keys'}
                                                </Button>
                                            </RepoUrlRequiredTooltip>
                                        </div>
                                        {publicKey && <FormDescription>Add this public key as deploy key in your git provider.</FormDescription>}
                                    </div>}

                                    {publicKey && (<>
                                        <FormField
                                            control={form.control}
                                            name="gitBranch"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Git Branch</FormLabel>
                                                    <FormControl>
                                                        <RepoUrlRequiredTooltip active={!hasGitUrl}>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full justify-start"
                                                                disabled={field.disabled || !hasGitUrl}
                                                                onClick={() => openBranchDialog('GIT_SSH')}
                                                            >
                                                                <GitBranch className="h-4 w-4" />
                                                                <span className="truncate">{field.value || 'Select Branch'}</span>
                                                            </Button>
                                                        </RepoUrlRequiredTooltip>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="buildMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Build Method</FormLabel>
                                                    <Select
                                                        disabled={field.disabled || !hasGitUrl}
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <RepoUrlRequiredTooltip active={!hasGitUrl}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select build method" />
                                                                </SelectTrigger>
                                                            </RepoUrlRequiredTooltip>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="RAILPACK">detect automatically (using railpack)</SelectItem>
                                                            <SelectItem value="DOCKERFILE">Dockerfile</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {sourceTypeField.buildMethod === 'DOCKERFILE' && (<>
                                            <FormField
                                                control={form.control}
                                                name="dockerfilePath"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Path to Dockerfile</FormLabel>
                                                        <FormControl>
                                                            <IconInput icon={FileCode2} placeholder="./Dockerfile" {...field} value={field.value as string | number | readonly string[] | undefined} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>)}
                                    </>)}
                                </div>

                            </TabsContent>
                            <TabsContent value="CONTAINER" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="containerImageSource"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Docker Image Name</FormLabel>
                                            <FormControl>
                                                <IconInput icon={Package} {...field} value={field.value as string | number | readonly string[] | undefined} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">

                                    <FormField
                                        control={form.control}
                                        name="containerRegistryUsername"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registry Username</FormLabel>
                                                <FormControl>
                                                    <IconInput icon={User} {...field} value={field.value as string | number | readonly string[] | undefined} />
                                                </FormControl>
                                                <FormDescription>Only required if your image is stored in a private registry.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="containerRegistryPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registry Password</FormLabel>
                                                <FormControl>
                                                    <IconInput icon={LockKeyhole} type="password" {...field} value={field.value as string | number | readonly string[] | undefined} />
                                                </FormControl>
                                                <FormDescription>Only required if your image is stored in a private registry.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    {!readonly && <CardFooter className="gap-4">
                        <SubmitButton>Save</SubmitButton>
                        <p className="text-red-500">{state?.message}</p>
                    </CardFooter>}
                </form>
            </Form >
        </Card >
        <Dialog open={isPublicKeyDialogOpen} onOpenChange={setIsPublicKeyDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Public SSH Key</DialogTitle>
                    <DialogDescription>You need to <span className="font-semibold">add this public key as deploy key</span> in your git provider. Otherwise QuickStack won't be able to access the git repository.</DialogDescription>
                </DialogHeader>
                <Textarea
                    readOnly
                    value={publicKey ?? ''}
                    className="min-h-32 font-mono"
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={copyPublicKey} disabled={!publicKey}>
                        <ClipboardCopy />
                        Copy
                    </Button>
                    <Button type="button" onClick={() => setIsPublicKeyDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </>;
}

function IconInput({ icon: Icon, className, ...props }: ComponentProps<typeof Input> & { icon: LucideIcon }) {
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className={cn("pl-9", className)} {...props} />
        </div>
    );
}

function RepoUrlRequiredTooltip({ active, children }: { active: boolean; children: ReactNode }) {
    if (!active) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="block w-full cursor-not-allowed">{children}</span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{repoUrlRequiredMessage}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
