const AccountCode = () => {
  return (
    <div>
      <div className="block w-full p-8">
        <select
          id="countries"
          className="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none"
        >
          <option defaultValue="" disabled>
            Select a Layer
          </option>
          <option value="Layer1">Layer 1</option>
          <option value="Layer2">Layer 1</option>
          <option value="Layer3">Layer 1</option>
          <option value="Layer4">Layer 1</option>
        </select>
      </div>
    </div>
  );
};

export default AccountCode;
