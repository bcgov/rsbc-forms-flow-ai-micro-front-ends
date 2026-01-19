import DBServiceHelper from "../helpers/helperDbServices";
import { fetchStaticData } from "../request/staticDataApi";
import { updateUserLastActiveApi } from '../request/updateUserLastActiveApi';
import { POOR_CONNECTION_THRESHOLD, UPDATE_LAST_ACTIVE_TIMER } from "../endpoints/config";

class ConnectivityMonitor {
  private static instance: ConnectivityMonitor;
  private isOnline: boolean;
  private hasPoorConnection: boolean = false;
  private isConnected: boolean = true;
  private listeners: Array<(status: boolean) => void> = [];
  private updateLastActiveIntervalId: any = null;
  private connectivityCheckIntervalId: any = null;

  private constructor() {
    this.isOnline = this.isConnected && !this.hasPoorConnection;
    this.isConnected = navigator.onLine;
    this.listeners = [];
    window.addEventListener('online', this.navigatorConnectivityHandler.bind(this));
    window.addEventListener('offline', this.navigatorConnectivityHandler.bind(this));

    // Periodically check connectivity to a reliable endpoint
    this.startMonitoring();
  }

  public static getInstance(): ConnectivityMonitor {
    if (!ConnectivityMonitor.instance) {
      ConnectivityMonitor.instance = new ConnectivityMonitor();
      console.log('[ConnectivityMonitor] instance created');
    }
    window['connectivityMonitor'] = ConnectivityMonitor.instance;
    window.dispatchEvent(new Event('connectivityMonitorReady'));
    return ConnectivityMonitor.instance;
  }

  private async checkConnectivityWithApi() {   
    try {
      if (this.isConnected) {
        await fetchStaticData(
          "cities",         
          (data: any) => {
            console.log("[ConnectivityMonitor] Connection is healthy.");
            this.hasPoorConnection = false;
            this.updateStatus();
          },
          (data: any) => {
            console.warn("[ConnectivityMonitor] Connection check failed:", data);
            this.hasPoorConnection = true;
            this.updateStatus();
          },
          POOR_CONNECTION_THRESHOLD * 1000
        );
      }
    } catch (error) {
      console.warn("[ConnectivityMonitor] Connection too slow, request timed out.");
      this.hasPoorConnection = true;
      this.updateStatus();
    }    
  }

  private async updateLastActive() {   
    try {
      if (this.isOnline) {
        await updateUserLastActiveApi(
          DBServiceHelper.getUserGuid(),
          POOR_CONNECTION_THRESHOLD * 1000,
          (data: any) => {
            console.debug("[ConnectivityMonitor] Update last active: ", data);
          },
          (data: any) => {
            console.warn("[ConnectivityMonitor] Update last active failed:", data);
          }
        );
      }
    } catch (error) {
      console.warn("[ConnectivityMonitor] Update last active request failed.");
    }
  }

  private updateStatus() {
    if (this.isOnline == this.isConnected && !this.hasPoorConnection) {
      return; // No change in status
    }
    this.isOnline = this.isConnected && !this.hasPoorConnection;
    this.notifyListeners();
  }

  private navigatorConnectivityHandler() {
    this.isConnected = navigator.onLine;
    this.updateStatus();
  }

  private notifyListeners() {
    console.log(`[ConnectivityMonitor] status changed: ${this.isOnline ? 'online' : 'offline'}`);
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: (status: boolean) => void) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: (status: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public startMonitoring() {
    if (this.updateLastActiveIntervalId) {
      clearInterval(this.updateLastActiveIntervalId);
    }
    if (this.connectivityCheckIntervalId) {
      clearInterval(this.connectivityCheckIntervalId);
    }

    this.connectivityCheckIntervalId = setInterval(() => {
      this.checkConnectivityWithApi();
    }, 30 * 1000); // every 30 seconds
    this.updateLastActiveIntervalId = setInterval(() => {
        this.updateLastActive();
    }, UPDATE_LAST_ACTIVE_TIMER * 1000);
  }

  public stopMonitoring() {
    if (this.updateLastActiveIntervalId) {
      clearInterval(this.updateLastActiveIntervalId);
      this.updateLastActiveIntervalId = null;
    }
    if (this.connectivityCheckIntervalId) {
      clearInterval(this.connectivityCheckIntervalId);
      this.connectivityCheckIntervalId = null;
    }
  }
}

export default ConnectivityMonitor.getInstance();