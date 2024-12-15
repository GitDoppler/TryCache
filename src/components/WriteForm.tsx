import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const writeFormSchema = z.object({
  address: z.coerce.number().min(1).max(100),
  data: z.string().min(2).max(50),
});

type WriteFormValues = z.infer<typeof writeFormSchema>;

export function WriteForm({
  writeToCache,
}: {
  writeToCache: (address: number, data: string) => void;
}) {
  const form = useForm<WriteFormValues>({
    resolver: zodResolver(writeFormSchema),
    defaultValues: {
      address: 1,
      data: "",
    },
  });

  function onSubmit(values: WriteFormValues) {
    writeToCache(values.address, values.data);
    alert("Data written to cache.");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="1" {...field} />
              </FormControl>
              <FormDescription>
                This is the address where data will be written.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input placeholder="example" {...field} />
              </FormControl>
              <FormDescription>
                This is the data which will be written.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
