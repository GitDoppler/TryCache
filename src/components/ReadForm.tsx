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
import { useState } from "react";

const readFormSchema = z.object({
  address: z.coerce.number().min(1).max(100),
});

type ReadFormValues = z.infer<typeof readFormSchema>;

export function ReadForm({
  readFromCache,
}: {
  readFromCache: (address: number) => string | null;
}) {
  const [readResult, setReadResult] = useState<string | null>(null);

  const form = useForm<ReadFormValues>({
    resolver: zodResolver(readFormSchema),
    defaultValues: {
      address: 1,
    },
  });

  function onSubmit(values: ReadFormValues) {
    const data = readFromCache(values.address);
    setReadResult(data);
  }

  return (
    <div className="space-y-8">
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
                  Enter the address to read data from the cache.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Read</Button>
        </form>
      </Form>

      {readResult !== null && (
        <div>
          <h3 className="font-bold">Read Result:</h3>
          <p>{readResult}</p>
        </div>
      )}
    </div>
  );
}
