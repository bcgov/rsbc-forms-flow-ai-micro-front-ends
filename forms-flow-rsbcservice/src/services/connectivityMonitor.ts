class ConnectivityMonitor {
  private static instance: ConnectivityMonitor;
  private isOnline: boolean;
  private listeners: Array<(status: boolean) => void> = [];

  private constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  public static getInstance(): ConnectivityMonitor {
    if (!ConnectivityMonitor.instance) {
      ConnectivityMonitor.instance = new ConnectivityMonitor();
      console.log('ConnectivityMonitor instance created');
    }
    window['connectivityMonitor'] = ConnectivityMonitor.instance;
    window.dispatchEvent(new Event('connectivityMonitorReady'));
    return ConnectivityMonitor.instance;
  }

  private updateStatus() {
    this.isOnline = navigator.onLine;
    this.notifyListeners();
  }

  private notifyListeners() {
    console.log(`ConnectivityMonitor status changed: ${this.isOnline ? 'online' : 'offline'}`);
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
}

export default ConnectivityMonitor.getInstance();