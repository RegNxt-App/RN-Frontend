import "./App.css";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rn/rnui";
import { AlertCircle } from "lucide-react";

function App() {
  const sourceColumn = ["Abc", "XYZ"];

  return (
    <div className="mx-[200px]">
      <div className="flex w-full  flex-col  items-center justify-center gap-3 my-5">
        <Button className="w-full" type="submit">
          Hello Nice
        </Button>
        <Input type="password" />

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all mandatory fields to see the content.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="sourceColumn" className="text-right">
            Source Column
          </label>
          <Select
            value={"abc"}
            onValueChange={(val) => console.log("ok: ", val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ABC">All Frameworks</SelectItem>
              {sourceColumn.map((framework) => (
                <SelectItem key={framework} value={framework}>
                  {framework}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    </div>
  );
}

export default App;
