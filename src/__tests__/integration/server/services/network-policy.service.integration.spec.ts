// @vitest-environment node

vi.mock('@/server/adapter/kubernetes-api.adapter', () => ({ default: {} }));

import { createK3sTestContext } from '@/__tests__/k3s-test.utils';
import networkPolicyService from '@/server/services/network-policy.service';
import { KubeObjectNameUtils } from '@/server/utils/kube-object-name.utils';
import { AppExtendedModel } from '@/shared/model/app-extended.model';

describe('network-policy.service integration', () => {
    const ctx = createK3sTestContext();

    it('creates a NetworkPolicy that allows external ingress to App Node Ports', async () => {
        const namespace = 'node-port-policy-test';
        const { core, network } = ctx.getClients();
        await core.createNamespace({
            metadata: {
                name: namespace,
            },
        });

        await networkPolicyService.reconcileNetworkPolicy({
            id: 'demo-app',
            projectId: namespace,
            useNetworkPolicy: true,
            ingressNetworkPolicy: 'DENY_ALL',
            egressNetworkPolicy: 'DENY_ALL',
            appNodePorts: [
                {
                    id: 'node-port-1',
                    appId: 'demo-app',
                    port: 300,
                    nodePort: 30080,
                    protocol: 'TCP',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        } as AppExtendedModel);

        const policy = await network.readNamespacedNetworkPolicy(KubeObjectNameUtils.toNetworkPolicyName('demo-app'), namespace);

        expect(policy.body.spec?.ingress).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    from: [{ ipBlock: { cidr: '0.0.0.0/0' } }],
                    ports: [{ protocol: 'TCP', port: 300 }],
                }),
            ])
        );
    });
});
