import { Container } from '~di/container';
import { ServiceKeys } from '~di/services';

import { FsConfig, FsUserContext } from '~config/types';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';
import { SdkUserContext } from '~api/data-contracts';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import { EventCallback, FsEventType } from '~managers/event/types';
import { flagManagerFactory } from '~managers/flag/flag-manager-factory';
import {
  FeatureFlags,
  FlagReturnType,
  IsFeatureFlagsEmpty,
  NoExplicitReturnType,
} from '~managers/flag/types';
import { killManager } from '~managers/kill/kill-manager';
import { serviceManager } from '~managers/service/service-manager';
import { storageManagerFactory } from '~managers/storage/storage-manger-factory';
import { syncManagerFactory } from '~managers/sync/sync-manager-factory';
import { trackManagerFactory } from '~managers/track/track-manager-factory';

export class FsClient {
  private readonly container: Container;
  private initialized = false;

  constructor(config: FsConfig) {
    const settings = buildSettingsFromConfig(config);
    this.container = Container.getInstance(settings);
    this.registerServices();
  }

  private registerServices(): void {
    if (this.initialized) return;

    this.container.register(ServiceKeys.ApiClient, () =>
      apiClientFactory(this.container.getSettings()),
    );

    this.container.register(ServiceKeys.EventManager, () =>
      eventManagerFactory(),
    );

    this.container.register(ServiceKeys.StorageManager, (c) => {
      return storageManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    this.container.register(ServiceKeys.SyncManager, (c) => {
      return syncManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    this.container.register(ServiceKeys.TrackManager, (c) => {
      return trackManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    this.container.register(ServiceKeys.FlagManager, (c) => {
      return flagManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.StorageManager),
        c.get(ServiceKeys.TrackManager),
      );
    });

    this.container.register(ServiceKeys.ServiceManager, (c) => {
      return serviceManager(
        c.getSettings(),
        c.get(ServiceKeys.ApiClient).sdk,
        c.get(ServiceKeys.StorageManager),
        c.get(ServiceKeys.EventManager),
      );
    });

    this.container.register(ServiceKeys.KillManager, (c) => {
      return killManager(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
        c.get(ServiceKeys.SyncManager),
        c.get(ServiceKeys.TrackManager),
      );
    });

    this.initialized = true;
  }

  /**
   * Evaluates a feature flag for a given user context with full type-safety.
   *
   * This function is designed to work with or without `FlagSync CLI` generated
   * TypeScript types, providing robust type inference, validation, and autocompletion.
   *
   * @example With FlagSync CLI generated types (recommended for full type-safety and DX):
   * ```ts
   * declare module '@flagsync/node-sdk' {
   *   interface FeatureFlags {
   *     'price-discount': 0.1 | 0.2;
   *     'layout': 'v1' | 'v2' | 'v3';
   *     'killswitch': boolean;
   *   }
   * }
   *
   * const ctx = { key: 'user123' };
   *
   * const discount = client.flag(ctx, 'price-discount');         // Type: 0.1 | 0.2
   * const layout = client.flag(ctx, 'layout', 'v1');             // Type: 'v1' | 'v2' | 'v3' (defaultValue must be 'v1' | 'v2' | 'v3')
   * const isEnabled = client.flag(ctx, 'killswitch');            // Type: boolean
   * const value = client.flag(ctx, 'not-a-real-flag');           // ❌ TS Error: Argument is not a key of FeatureFlags
   * const badDefault = client.flag(ctx, 'price-discount', 0.5);  // ❌ TS Error: Default value type mismatch
   * ```
   *
   * When not using FlagSync CLI, you must manually type the flag value, or
   * it will be inferred as "unknown"
   *
   * @example Without FlagSync CLI generated types (manual type specification or inference as `unknown`):
   * ```ts
   * const ctx = { userId: 'user456' };
   *
   * const layout = client.flag<'v1' | 'v2'>(ctx, 'layout');             // Type: 'v1' | 'v2'
   * const discount = client.flag<number>(ctx, 'price-discount');        // Type: number
   * const enabled = client.flag<boolean>(ctx, 'enable-feature', false); // Type: boolean (defaultValue must be true or false)
   *
   * // Without an explicit generic (and no generated types), the return type is `unknown`:
   * const someDynamicKey = client.flag(ctx, 'some-dynamic-key');        // Type: unknown
   * ```
   */
  public flag<TReturn = NoExplicitReturnType, TKey extends string = string>(
    context: FsUserContext,
    flagKey: IsFeatureFlagsEmpty<FeatureFlags> extends true
      ? TKey
      :
          | (TKey extends keyof FeatureFlags ? TKey : never)
          | (keyof FeatureFlags extends never ? never : keyof FeatureFlags),

    defaultValue?: FlagReturnType<TReturn, TKey, FeatureFlags>,
  ): FlagReturnType<TReturn, TKey, FeatureFlags> {
    return this.container
      .get(ServiceKeys.FlagManager)
      .flag(context, flagKey, defaultValue);
  }

  public destroy(): Promise<void> {
    return this.container.get(ServiceKeys.KillManager).destroy();
  }

  public on<T extends FsEventType>(event: T, callback: EventCallback<T>): void {
    return this.container.get(ServiceKeys.EventManager).on(event, callback);
  }

  public once<T extends FsEventType>(
    event: T,
    callback: EventCallback<T>,
  ): void {
    return this.container.get(ServiceKeys.EventManager).once(event, callback);
  }

  public off<T extends FsEventType>(
    event: T,
    callback?: EventCallback<T>,
  ): void {
    return this.container.get(ServiceKeys.EventManager).off(event, callback);
  }

  public track(
    context: SdkUserContext,
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ): void {
    return this.container
      .get(ServiceKeys.TrackManager)
      .eventsManager.track(context, eventKey, value, properties);
  }

  public async waitForReady(): Promise<void> {
    return this.container.get(ServiceKeys.ServiceManager).initWithCatch;
  }

  public async waitForReadyCanThrow(): Promise<void> {
    return this.container.get(ServiceKeys.ServiceManager).initWithWithThrow;
  }
}
