import { Container } from '~di/container';
import { ServiceKeys } from '~di/services';

import { FsConfig, FsUserContext } from '~config/types';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';
import { SdkUserContext } from '~api/data-contracts';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import { EventCallback, FsEventType } from '~managers/event/types';
import { flagManagerFactory } from '~managers/flag/flag-manager-factory';
import { FlagKey } from '~managers/flag/types';
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

  public flag<T>(
    context: FsUserContext,
    flagKey: FlagKey,
    defaultValue?: T,
  ): T {
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
