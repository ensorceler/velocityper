import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function useTestConfiguration(): [
  TestConfig,
  Dispatch<SetStateAction<TestConfig>>
] {
  const mountRef = useRef<boolean | null>(null);
  const [config, setConfig] = useState<TestConfig>({
    testType: "timer",
    timerDuration: 15,
    wordCount: 50,
    quoteLength: "medium",
    testOngoing: false,
    includeCharacters: [],
  });

  const storeConfigToLocalStorage = () => {
    const configString = JSON.stringify(config);
    localStorage.setItem("test-config", configString);
  };

  useEffect(() => {
    // at mount check if configuration exists or not
    console.log("CONFIG STATUS ", config);
    if (mountRef.current === null) {
      mountRef.current = true;
      const configString = localStorage.getItem("test-config");
      if (configString !== null) {
        try {
          const parsedConfig = JSON.parse(configString);
          console.log("PARSED CONFIG ", parsedConfig);
          setConfig((p) => parsedConfig);
        } catch (err) {
          console.error("FAILED TO PARSE!", err);
        }
      }
    } else {
      storeConfigToLocalStorage();
    }
  }, [config]);

  return [config, setConfig];
}
