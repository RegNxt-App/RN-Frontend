const CurrencyRate = () => {
  return (
    <div>
      <div className="block w-full p-8">
        <select
          id="countries"
          className="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none"
        >
          <option defaultValue="" disabled>
            Select a Type
          </option>
          <option value="Layer1">Type 1</option>
          <option value="Layer2">Type 2</option>
        </select>
      </div>
    </div>
  );
};

export default CurrencyRate;
