interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader = ({ size = 32, color = 'text-surface' }: LoaderProps) => {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${color}`}
      style={{ width: size, height: size }}
      role="status"
    >
      <span className="absolute m-[-1px] h-[1px] w-[1px] overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default Loader;
