import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
// Import RSBCImage from the parent project's source directory
import RSBCImage from "../../../src/component/RSBCImage/RSBCImage";

export interface RSBCImageWrapperProps {
  data: any;
  component: any;
  builderMode: boolean;
}

export interface RSBCImageWrapperRef {
  handlePrint: () => void;
  handleSubmissionPrint: () => void;
  getBase64Images: (stage?: string) => Promise<Record<string, string>>;
}

const RSBCImageWrapper = forwardRef<RSBCImageWrapperRef, RSBCImageWrapperProps>(
  ({ data, component, builderMode }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<RSBCImage | null>(null);

    useImperativeHandle(ref, () => ({
      handlePrint: () => {
        instanceRef.current?.handlePrint();
      },
      handleSubmissionPrint: () => {
        instanceRef.current?.handleSubmissionPrint();
      },
      getBase64Images: (stage?: string) => {
        return instanceRef.current?.getBase64Images(stage) ?? Promise.resolve({});
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const instance = new RSBCImage(component, {}, data);
      instance.builderMode = builderMode;
      instanceRef.current = instance;
      console.log(data);

      instance.attachReact(containerRef.current);

      return () => {
        // RSBCImage.detachReact() creates a new root which would cause a warning,
        // so we clear the container directly.
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        instanceRef.current = null;
      };
    }, [data, component, builderMode]);

    return <div ref={containerRef} style={{ width: "100%" }} />;
  }
);

RSBCImageWrapper.displayName = "RSBCImageWrapper";

export default RSBCImageWrapper;
