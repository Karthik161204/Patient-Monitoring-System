import { useEffect, useState } from "react";

const InstallApp = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isIOS] = useState(() =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstallHelp((visible) => !visible);
      return;
    }

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error("Unable to install the app:", error);
    }
  };

  if (!installPrompt && !isIOS) return null;

  return (
    <aside className="install-app">
      {showInstallHelp && (
        <p className="install-help" role="status">
          Tap Share, then “Add to Home Screen” to install this app.
        </p>
      )}
      <button className="btn btn-primary install-button" type="button" onClick={handleInstall}>
        Install app
      </button>
    </aside>
  );
};

export default InstallApp;
