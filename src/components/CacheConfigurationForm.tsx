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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CacheType, ReplacementPolicy, WritePolicy } from "@/hooks/useCacheV2";

const configSchema = z.object({
  numSets: z.coerce.number().min(1).max(64),
  cacheType: z.enum(["direct-mapped", "set-associative"]),
  replacementPolicy: z.enum(["LRU", "Random"]),
  writePolicy: z.enum(["write-back", "write-through"]),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

export function CacheConfigurationForm({
  onConfigured,
}: {
  onConfigured: (values: ConfigFormValues) => void;
}) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      numSets: 8,
      cacheType: "direct-mapped",
      replacementPolicy: "LRU",
      writePolicy: "write-back",
    },
  });

  const onSubmit = (values: ConfigFormValues) => {
    onConfigured(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="numSets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sets</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Configure how many sets the cache will have.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cacheType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cache Type</FormLabel>
              <Select
                onValueChange={(val: CacheType) => field.onChange(val)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Cache Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="direct-mapped">Direct-Mapped</SelectItem>
                  <SelectItem value="set-associative">
                    Set-Associative
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="replacementPolicy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Replacement Policy</FormLabel>
              <Select
                onValueChange={(val: ReplacementPolicy) => field.onChange(val)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Replacement Policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LRU">LRU</SelectItem>
                  <SelectItem value="Random">Random</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="writePolicy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Write Policy</FormLabel>
              <Select
                onValueChange={(val: WritePolicy) => field.onChange(val)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Write Policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="write-back">Write-Back</SelectItem>
                  <SelectItem value="write-through">Write-Through</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Initialize Cache</Button>
      </form>
    </Form>
  );
}
