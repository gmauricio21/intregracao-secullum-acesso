"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import type { StylesConfig } from "react-select";

const API_URL = "http://192.168.1.133:3000";

type Opcao = {
  id: number;
  nome: string;
};

type Empresa = {
  id: number;
  nome: string;
  cnpj: string;
};

type Horario = {
  id: number;
  nome: string;
  tipo: "HORARIO" | "NIVEL";
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [classificacoes, setClassificacoes] = useState<Opcao[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [niveis, setNiveis] = useState<Opcao[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [classificacaoInput, setClassificacaoInput] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");

  const [formData, setFormData] = useState({
    n_folha: "",
    n_identificador: "",
    nome: "",
    classificacao: "",
    nova_classificacao: "",
    empresa_cnpj: "",
    novo_empresa_nome: "",
    novo_empresa_cnpj: "",
    estado: "0",
    horario_nome: "",
    nivel_nome: "",
  });

  const horarioSelecionado = useMemo(() => {
    return horarios.find((h) => h.nome === formData.horario_nome);
  }, [horarios, formData.horario_nome]);

  const usaNivel = horarioSelecionado?.tipo === "NIVEL";

  const inputClassName =
    "w-full h-[42px] bg-slate-700 border border-slate-600 rounded-lg px-3 text-[13px] text-white placeholder:text-slate-400 outline-none focus:border-blue-500";

  type SelectOption = {
    value: string;
    label: string;
    tipo?: "HORARIO" | "NIVEL";
  };

  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#334155",
      borderColor: state.isFocused ? "#3b82f6" : "#475569",
      boxShadow: "none",
      minHeight: "42px",
      height: "42px",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontSize: "13px",
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 10px",
      height: "42px",
    }),

    input: (base) => ({
      ...base,
      color: "white",
      fontSize: "13px",
      margin: 0,
      padding: 0,
    }),

    singleValue: (base) => ({
      ...base,
      color: "white",
      fontSize: "13px",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#cbd5e1",
      fontSize: "13px",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#cbd5e1",
      padding: "7px",
      cursor: "pointer",

      ":hover": {
        color: "white",
        cursor: "pointer",
      },
    }),

    clearIndicator: (base) => ({
      ...base,
      color: "#cbd5e1",
      padding: "7px",
      cursor: "pointer",

      ":hover": {
        color: "white",
        cursor: "pointer",
      },
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: "#1e293b",
      borderRadius: "0.5rem",
      overflow: "hidden",
      zIndex: 9999,
      fontSize: "13px",
    }),

    menuList: (base) => ({
      ...base,
      padding: 0,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#2563eb" : "#1e293b",
      color: "white",
      cursor: "pointer",
      fontSize: "13px",
      padding: "9px 10px",
    }),
  };

  const nivelSelectStyles: StylesConfig<SelectOption, false> = {
    ...selectStyles,

    control: (base, state) => ({
      ...base,
      backgroundColor: usaNivel ? "#334155" : "#0f172a",
      borderColor: state.isFocused ? "#3b82f6" : "#475569",
      boxShadow: "none",
      minHeight: "42px",
      height: "42px",
      borderRadius: "0.5rem",
      cursor: usaNivel ? "pointer" : "not-allowed",
      fontSize: "13px",
      opacity: usaNivel ? 1 : 0.6,
    }),
  };

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        setLoadingOptions(true);

        const [classificacoesRes, empresasRes, horariosRes, niveisRes] =
          await Promise.all([
            fetch(`${API_URL}/opcoes/classificacoes`),
            fetch(`${API_URL}/opcoes/empresas`),
            fetch(`${API_URL}/opcoes/horarios`),
            fetch(`${API_URL}/opcoes/niveis`),
          ]);

        const classificacoesData = await classificacoesRes.json();
        const empresasData = await empresasRes.json();
        const horariosData = await horariosRes.json();
        const niveisData = await niveisRes.json();

        setClassificacoes(classificacoesData);
        setEmpresas(empresasData);
        setHorarios(horariosData);
        setNiveis(niveisData);

        setFormData((prev) => ({
          ...prev,
          classificacao: "",
          empresa_cnpj: "",
          horario_nome: "",
          nivel_nome: "",
        }));
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar opções do Secullum");
      } finally {
        setLoadingOptions(false);
      }
    }

    carregarOpcoes();
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  async function handleSubmit() {
    if (
      !formData.n_folha ||
      !formData.nome ||
      !formData.empresa_cnpj ||
      !formData.classificacao ||
      !formData.horario_nome
    ) {
      showToast(
        "error",
        "Preencha Número Folha, Nome, Classificação, Empresa e Horário",
      );
      return;
    }

    if (usaNivel && !formData.nivel_nome) {
      showToast("error", "Selecione um nível de acesso");
      return;
    }

    try {
      setLoading(true);

      const empresaFinal =
        formData.empresa_cnpj === "__NOVA__"
          ? formData.novo_empresa_cnpj
          : formData.empresa_cnpj;

      const classificacaoFinal =
        formData.classificacao === "__NOVA__"
          ? formData.nova_classificacao
          : formData.classificacao;

      const body = {
        ...formData,
        classificacao: classificacaoFinal,
        empresa_cnpj: empresaFinal,
        estado: Number(formData.estado),
        tipoAcesso: usaNivel ? "NIVEL" : "HORARIO",
        nivel_nome: usaNivel ? formData.nivel_nome : null,
      };

      const response = await fetch(`${API_URL}/pessoas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("error", data.message || "Erro ao cadastrar");
        return;
      }

      showToast(
        "success",
        data.message || "Pessoa enviada para integração com sucesso!",
      );

      setClassificacaoInput("");
      setEmpresaInput("");

      setFormData({
        n_folha: "",
        n_identificador: "",
        nome: "",
        classificacao: "",
        nova_classificacao: "",
        empresa_cnpj: "",
        novo_empresa_nome: "",
        novo_empresa_cnpj: "",
        estado: "0",
        horario_nome: "",
        nivel_nome: "",
      });
    } catch (error) {
      console.error(error);
      showToast("error", "Erro ao conectar com API");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "horario_nome") {
        const horario = horarios.find((h) => h.nome === value);

        return {
          ...prev,
          horario_nome: value,
          nivel_nome: horario?.tipo === "NIVEL" ? "" : "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      {toast && (
        <div
          className={`fixed top-4 left-4 z-[9999] rounded-lg px-4 py-3 text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="w-full max-w-xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-5">
        <h1 className="text-2xl font-bold text-center text-white mb-5">
          Integração Secullum
        </h1>

        {loadingOptions ? (
          <p className="text-white text-center">Carregando opções...</p>
        ) : (
          <form className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Número Folha *
              </label>
              <input
                type="text"
                name="n_folha"
                placeholder="Ex: 000123"
                value={formData.n_folha}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Número Identificador
              </label>
              <input
                type="text"
                name="n_identificador"
                placeholder="Ex: 123456"
                value={formData.n_identificador}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Classificação *
              </label>

              <Select
                options={classificacoes.map((item) => ({
                  value: item.nome,
                  label: item.nome,
                }))}
                value={
                  formData.classificacao
                    ? {
                        value: formData.classificacao,
                        label: formData.classificacao,
                      }
                    : null
                }
                inputValue={classificacaoInput}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    classificacao: selected?.value || "",
                  }));

                  if (!selected) {
                    setClassificacaoInput("");
                  }
                }}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === "input-change") {
                    setClassificacaoInput(value);

                    setFormData((prev) => ({
                      ...prev,
                      classificacao: value,
                    }));
                  }

                  if (actionMeta.action === "menu-close") {
                    setClassificacaoInput("");
                  }
                }}
                placeholder="Digite ou selecione uma classificação"
                isClearable
                menuPlacement="auto"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Nenhuma classificação encontrada"}
                styles={selectStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Empresa *
              </label>

              <Select
                options={empresas.map((empresa) => ({
                  value: empresa.cnpj,
                  label: `${empresa.nome} - ${empresa.cnpj}`,
                }))}
                value={
                  formData.empresa_cnpj
                    ? {
                        value: formData.empresa_cnpj,
                        label: formData.empresa_cnpj,
                      }
                    : null
                }
                inputValue={empresaInput}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    empresa_cnpj: selected?.value || "",
                  }));

                  if (!selected) {
                    setEmpresaInput("");
                  }
                }}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === "input-change") {
                    setEmpresaInput(value);

                    setFormData((prev) => ({
                      ...prev,
                      empresa_cnpj: value,
                    }));
                  }

                  if (actionMeta.action === "menu-close") {
                    setEmpresaInput("");
                  }
                }}
                placeholder="Digite ou selecione uma empresa/CNPJ"
                isClearable
                menuPlacement="auto"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Nenhuma empresa encontrada"}
                styles={selectStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Estado
              </label>

              <Select
                options={[
                  { value: "0", label: "Ativo" },
                  { value: "1", label: "Bloqueado" },
                  { value: "2", label: "Livre" },
                  { value: "3", label: "Desligado" },
                ]}
                value={[
                  { value: "0", label: "Ativo" },
                  { value: "1", label: "Bloqueado" },
                  { value: "2", label: "Livre" },
                  { value: "3", label: "Desligado" },
                ].find((item) => item.value === formData.estado)}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    estado: selected?.value || "0",
                  }));
                }}
                placeholder="Selecione um estado"
                isSearchable={false}
                menuPlacement="auto"
                classNamePrefix="react-select"
                styles={selectStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Horário
              </label>

              <Select
                options={horarios.map((horario) => ({
                  value: horario.nome,
                  label: horario.nome,
                  tipo: horario.tipo,
                }))}
                value={
                  formData.horario_nome
                    ? {
                        value: formData.horario_nome,
                        label: formData.horario_nome,
                      }
                    : null
                }
                onChange={(selected) => {
                  const horario = horarios.find(
                    (h) => h.nome === selected?.value,
                  );

                  setFormData((prev) => ({
                    ...prev,
                    horario_nome: selected?.value || "",
                    nivel_nome: horario?.tipo === "NIVEL" ? "" : "",
                  }));
                }}
                placeholder="Selecione um horário"
                isSearchable={false}
                menuPlacement="auto"
                classNamePrefix="react-select"
                styles={selectStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Nível de Acesso
              </label>

              <Select
                options={niveis.map((nivel) => ({
                  value: nivel.nome,
                  label: nivel.nome,
                }))}
                value={
                  formData.nivel_nome
                    ? {
                        value: formData.nivel_nome,
                        label: formData.nivel_nome,
                      }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    nivel_nome: selected?.value || "",
                  }));
                }}
                placeholder={
                  usaNivel
                    ? "Selecione um nível"
                    : "Selecione <Por Nivel de Acesso> no horário"
                }
                isSearchable={false}
                isDisabled={!usaNivel}
                menuPlacement="auto"
                classNamePrefix="react-select"
                styles={nivelSelectStyles}
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-sm text-white font-semibold py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Cadastrando..." : "Cadastrar Pessoa"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
