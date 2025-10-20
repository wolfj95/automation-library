import { createClient } from '@supabase/supabase-js';
import { Automation, NewAutomationInput } from '@/types/automation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DataService {
  // GET all automations
  static async getAllAutomations(): Promise<Automation[]> {
    const { data: automations, error: automationsError } = await supabase
      .from('automations')
      .select('*')
      .order('submission_date', { ascending: false });

    if (automationsError) throw automationsError;

    // Fetch links and reactions for each automation
    const automationsWithRelations = await Promise.all(
      (automations || []).map(async (automation) => {
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
    const { data: automation, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !automation) return null;

    const [links, reactions] = await Promise.all([
      this.getLinksForAutomation(id),
      this.getReactionsForAutomation(id)
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
  }

  // POST new automation
  static async createAutomation(input: NewAutomationInput): Promise<Automation> {
    const { data: automation, error } = await supabase
      .from('automations')
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

    // Insert links
    if (input.links.length > 0) {
      const linksToInsert = input.links.map(link => ({
        automation_id: automation.id,
        title: link.title,
        url: link.url
      }));

      await supabase.from('automation_links').insert(linksToInsert);
    }

    return this.getAutomationById(automation.id) as Promise<Automation>;
  }

  // PUT update automation
  static async updateAutomation(id: string, input: NewAutomationInput): Promise<Automation | null> {
    // Update the automation
    const { error: updateError } = await supabase
      .from('automations')
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

      const { error: insertError } = await supabase
        .from('automation_links')
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
    // Try to increment existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('automation_id', automationId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      await supabase
        .from('reactions')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('reactions')
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
    const { data: automations } = await supabase
      .from('automations')
      .select('tags');

    if (!automations) return [];

    const tagSet = new Set<string>();
    automations.forEach(a => a.tags?.forEach((tag: string) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }

  // Helper: Get links for an automation
  private static async getLinksForAutomation(automationId: string) {
    const { data: links } = await supabase
      .from('automation_links')
      .select('title, url')
      .eq('automation_id', automationId);

    return links || [];
  }

  // Helper: Get reactions for an automation
  private static async getReactionsForAutomation(automationId: string) {
    const { data: reactions } = await supabase
      .from('reactions')
      .select('emoji, count')
      .eq('automation_id', automationId);

    return reactions || [];
  }
}