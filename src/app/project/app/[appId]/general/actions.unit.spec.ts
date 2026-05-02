const gitServiceMock = vi.hoisted(() => ({
    listRemoteBranches: vi.fn(),
}));

const actionWrapperMock = vi.hoisted(() => ({
    isAuthorizedWriteForApp: vi.fn(),
}));

vi.mock('@/server/services/git.service', () => ({
    default: gitServiceMock,
}));

vi.mock('@/server/utils/action-wrapper.utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/server/utils/action-wrapper.utils')>();
    return {
        ...actual,
        isAuthorizedWriteForApp: actionWrapperMock.isAuthorizedWriteForApp,
    };
});

import { getGitBranches } from './actions';

describe('general app source actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        actionWrapperMock.isAuthorizedWriteForApp.mockResolvedValue(undefined);
        gitServiceMock.listRemoteBranches.mockResolvedValue(['main', 'develop']);
    });

    it('lists git branches through the backend after checking write access', async () => {
        await expect(getGitBranches('app-1', {
            sourceType: 'GIT',
            gitUrl: 'https://github.com/biersoeckli/dummy-node-app.git',
            gitUsername: 'user',
            gitToken: 'token',
        })).resolves.toMatchObject({
            status: 'success',
            data: ['main', 'develop'],
        });

        expect(actionWrapperMock.isAuthorizedWriteForApp).toHaveBeenCalledWith('app-1');
        expect(gitServiceMock.listRemoteBranches).toHaveBeenCalledWith({
            id: 'app-1',
            sourceType: 'GIT',
            gitUrl: 'https://github.com/biersoeckli/dummy-node-app.git',
            gitUsername: 'user',
            gitToken: 'token',
        });
    });
});
