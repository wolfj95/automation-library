import { createClient } from '@supabase/supabase-js';
import { Automation, NewAutomationInput } from '@/types/automation';

// Lazy initialization of Supabase client to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export class DataService {
  // GET all automations
  static async getAllAutomations(): Promise<Automation[]> {
    const { data: automations, error: automationsError } = await getSupabaseClient()
      .from('automations')
      .select('*')
      .order('submission_date', { ascending: false });

    if (automationsError) throw automationsError;

    // Fetch links and reactions for each automation
    const automationsWithRelations = await Promise.all(
      (automations || []).map(async (automation: any) => {
        const [links, reactions] = await Promise.all([
          this.getLinksForAutomation(automation.id),
          this.getReactionsForAutomation(automation.id)
        ]);

        return {
          id: automation.id,
          title: automation.title,
          description: automation.description,
          studentName: automation.student_name,
          submissionDate: automation.submission_date,
          tags: automation.tags,
          images: automation.images,
          setupInstructions: automation.setup_instructions,
          installationCode: automation.installation_code,
          links,
          reactions
        } as Automation;
      })
    );

    return automationsWithRelations;
  }

  // GET automations by tag
  static async getAutomationsByTag(tag: string): Promise<Automation[]> {
    const allAutomations = await this.getAllAutomations();
    return allAutomations.filter(a => a.tags.includes(tag));
  }

  // GET single automation by ID
  static async getAutomationById(id: string): Promise<Automation | null> {
    const { data: automation, error } = await getSupabaseClient()
      .from('automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !automation) return null;

    const [links, reactions] = await Promise.all([
      this.getLinksForAutomation(id),
      this.getReactionsForAutomation(id)
    ]);

    const data: any = automation;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      studentName: data.student_name,
      submissionDate: data.submission_date,
      tags: data.tags,
      images: data.images,
      setupInstructions: data.setup_instructions,
      installationCode: data.installation_code,
      links,
      reactions
    } as Automation;
  }

  // POST new automation
  static async createAutomation(input: NewAutomationInput): Promise<Automation> {
    const supabase = getSupabaseClient();
    const { data: automation, error } = await (supabase
      .from('automations') as any)
      .insert({
        title: input.title,
        description: input.description,
        student_name: input.studentName,
        tags: input.tags,
        images: input.images,
        setup_instructions: input.setupInstructions,
        installation_code: input.installationCode
      })
      .select()
      .single();

    if (error) throw error;

    const data: any = automation;
    // Insert links
    if (input.links.length > 0) {
      const linksToInsert = input.links.map(link => ({
        automation_id: data.id,
        title: link.title,
        url: link.url
      }));

      await (supabase.from('automation_links') as any).insert(linksToInsert);
    }

    return this.getAutomationById(data.id) as Promise<Automation>;
  }

  // PUT update automation
  static async updateAutomation(id: string, input: NewAutomationInput): Promise<Automation | null> {
    const supabase = getSupabaseClient();
    // Update the automation
    const { error: updateError } = await (supabase
      .from('automations') as any)
      .update({
        title: input.title,
        description: input.description,
        student_name: input.studentName,
        tags: input.tags,
        images: input.images,
        setup_instructions: input.setupInstructions,
        installation_code: input.installationCode
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Delete existing links
    const { error: deleteError } = await supabase
      .from('automation_links')
      .delete()
      .eq('automation_id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Don't throw - it's OK if there are no links to delete
    }

    // Insert new links
    if (input.links.length > 0) {
      const linksToInsert = input.links.map(link => ({
        automation_id: id,
        title: link.title,
        url: link.url
      }));

      const { error: insertError } = await (supabase
        .from('automation_links') as any)
        .insert(linksToInsert);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    return this.getAutomationById(id);
  }

  // POST add reaction to automation
  static async addReaction(automationId: string, emoji: string): Promise<Automation | null> {
    const supabase = getSupabaseClient();
    // Try to increment existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('automation_id', automationId)
      .eq('emoji', emoji)
      .single();

    const existingData: any = existing;
    if (existingData) {
      await (supabase
        .from('reactions') as any)
        .update({ count: existingData.count + 1 })
        .eq('id', existingData.id);
    } else {
      await (supabase
        .from('reactions') as any)
        .insert({
          automation_id: automationId,
          emoji,
          count: 1
        });
    }

    return this.getAutomationById(automationId);
  }

  // GET all unique tags
  static async getAllTags(): Promise<string[]> {
    const { data: automations } = await getSupabaseClient()
      .from('automations')
      .select('tags');

    if (!automations) return [];

    const tagSet = new Set<string>();
    automations.forEach((a: any) => a.tags?.forEach((tag: string) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }

  // Helper: Get links for an automation
  private static async getLinksForAutomation(automationId: string) {
    const { data: links } = await getSupabaseClient()
      .from('automation_links')
      .select('title, url')
      .eq('automation_id', automationId);

    return links || [];
  }

  // Helper: Get reactions for an automation
  private static async getReactionsForAutomation(automationId: string) {
    const { data: reactions } = await getSupabaseClient()
      .from('reactions')
      .select('emoji, count')
      .eq('automation_id', automationId);

    return reactions || [];
  }
}